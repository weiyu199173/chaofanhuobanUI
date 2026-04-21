# AI Agent Token & Digital Twin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Token-like system for AI integration, where external AI tools (OpenClaw, Hermes, etc.) can operate App with user's Digital Twin identity, with strict access control, rate limiting, and security guarantees.

**Architecture:**
- Core: Token generation, validation, and permission management system
- API Layer: RESTful endpoints for AI to call (create posts, send messages, etc.)
- Digital Twins: Independent identity system with own profiles and activity traces
- Rate Limiting: Built-in rate control (10-min cooldown for posts, 3s for messages)
- Frontend: "External AI Integration" page for token management

**Tech Stack:**
- React 19 + TypeScript + Vite (existing frontend)
- Supabase (auth, database, storage - existing)
- Express.js server (for API rate limiting and token validation)

---

## File Structure

```
/workspace/
├── src/
│   ├── types.ts (extend with new types)
│   ├── lib/
│   │   └── supabase.ts (extend)
│   ├── services/
│   │   ├── agentTokenService.ts (NEW)
│   │   ├── digitalTwinService.ts (NEW)
│   │   ├── rateLimitService.ts (NEW)
│   │   └── apiService.ts (NEW - for frontend to call our API)
│   ├── components/
│   │   └── screens/
│   │       ├── ExternalAiIntegrationScreen.tsx (NEW)
│   │       ├── DigitalTwinDetailScreen.tsx (NEW)
│   │       └── DigitalTwinCreateScreen.tsx (NEW)
│   └── api/
│       └── index.tsx (NEW - API route components)
├── server/
│   ├── index.ts (NEW - Express server main)
│   ├── routes/
│   │   ├── auth.ts (NEW - token validation middleware)
│   │   ├── posts.ts (NEW - API for posts)
│   │   └── messages.ts (NEW - API for messages)
│   └── middleware/
│       ├── rateLimit.ts (NEW)
│       └── security.ts (NEW)
├── docs/
│   └── api/
│       └── README.md (NEW - API documentation)
└── DATABASE_DESIGN.md (extend)
```

---

## Task 1: Extend Type Definitions

**Files:**
- Modify: `/workspace/src/types.ts`

First, let's define all the new types we'll need:

- Digital Twin (独立身份)
- Agent Token (访问令牌)
- API Request/Response Types

```typescript
// Add these to src/types.ts

// Digital Twin (数字孪生体)
export interface DigitalTwin {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  bio: string;
  personality_signature: string; // 人格签名
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Agent Token (AI访问令牌)
export interface AgentToken {
  id: string;
  user_id: string;
  twin_id: string;
  name: string; // Token display name
  token: string; // The actual token (hashed in DB, plaintext only at creation)
  permissions: {
    read: boolean;
    post: boolean;
    chat: boolean;
  };
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

// API Request Types
export interface CreatePostApiRequest {
  content: string;
  image_url?: string;
}

export interface SendMessageApiRequest {
  target_id: string;
  content: string;
}

// API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Extend existing types
export interface Post {
  // ... existing fields
  is_ai_post?: boolean;
  twin_id?: string;
}

export interface ContactProfile {
  // ... existing fields
  is_digital_twin?: boolean;
  twin_id?: string;
}
```

---

## Task 2: Database Design Extension

**Files:**
- Modify: `/workspace/DATABASE_DESIGN.md`

Update DATABASE_DESIGN.md with new table schemas:

```sql
-- ==========================================
-- DIGITAL TWINS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS digital_twins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  bio TEXT DEFAULT '',
  personality_signature TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_digital_twins_user_id ON digital_twins(user_id);

-- ==========================================
-- AGENT TOKENS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  permission_read BOOLEAN DEFAULT true,
  permission_post BOOLEAN DEFAULT true,
  permission_chat BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_agent_tokens_token_hash ON agent_tokens(token_hash);
CREATE INDEX idx_agent_tokens_user_id ON agent_tokens(user_id);
CREATE INDEX idx_agent_tokens_twin_id ON agent_tokens(twin_id);

-- ==========================================
-- RATE LIMITING TABLE (for tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'post' or 'chat'
  action_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_logs_twin_id ON rate_limit_logs(twin_id);
CREATE INDEX idx_rate_limit_logs_action_type ON rate_limit_logs(action_type);

-- ==========================================
-- EXTEND EXISTING TABLES
-- ==========================================
-- Add twin_id to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_ai_post BOOLEAN DEFAULT false;

-- ==========================================
-- RLS POLICIES
-- ==========================================
CREATE POLICY "Users can manage their own digital twins ON digital_twins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent tokens ON agent_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public can view digital twins (for profiles)
CREATE POLICY "Public can view digital twins ON digital_twins
  FOR SELECT
  USING (true);
```

---

## Task 3: Agent Token Service

**Files:**
- Create: `/workspace/src/services/agentTokenService.ts`

This service will handle token generation, validation, and management:

```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AgentToken, DigitalTwin } from '../types';
import * as crypto from 'crypto';

const TOKEN_PREFIX = 'tkn_';

export class AgentTokenService {
  // Generate a secure random token
  private static generateToken(): string {
    const randomBytes = crypto.randomBytes(32);
    return TOKEN_PREFIX + randomBytes.toString('base64url');
  }

  // Hash token for storage
  private static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Create new agent token
  static async createToken(params: {
    userId: string;
    twinId: string;
    name: string;
    permissions: { read: boolean; post: boolean; chat: boolean };
    expiresAt?: Date;
  }): Promise<{ token: string; tokenRecord: AgentToken } | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const plainToken = this.generateToken();
      const tokenHash = this.hashToken(plainToken);

      const { data, error } = await supabase
        .from('agent_tokens')
        .insert({
          user_id: params.userId,
          twin_id: params.twinId,
          name: params.name,
          token_hash: tokenHash,
          permission_read: params.permissions.read,
          permission_post: params.permissions.post,
          permission_chat: params.permissions.chat,
          expires_at: params.expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create agent token:', error);
        return null;
      }

      return {
        token: plainToken,
        tokenRecord: this.transformDBTokenToToken(data),
      };
    } catch (error) {
      console.error('Error creating agent token:', error);
      return null;
    }
  }

  // Get user's tokens
  static async getUserTokens(userId: string): Promise<AgentToken[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('agent_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get user tokens:', error);
        return [];
      }

      return (data || []).map(this.transformDBTokenToToken);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return [];
    }
  }

  // Revoke token
  static async revokeToken(tokenId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('agent_tokens')
        .update({ is_active: false })
        .eq('id', tokenId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to revoke token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  // Delete token
  static async deleteToken(tokenId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('agent_tokens')
        .delete()
        .eq('id', tokenId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to delete token:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting token:', error);
      return false;
    }
  }

  // Validate token (server-side)
  static async validateToken(token: string): Promise<{ valid: boolean; token?: AgentToken; twin?: DigitalTwin }> {
    if (!isSupabaseConfigured) return { valid: false };

    try {
      const tokenHash = this.hashToken(token);

      const { data, error } = await supabase
        .from('agent_tokens')
        .select(`
          *,
          twin:digital_twins(*)
        `)
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
          return { valid: false };
        }

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false };
      }

      return {
        valid: true,
        token: this.transformDBTokenToToken(data),
        twin: data.twin,
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }

  private static transformDBTokenToToken(dbToken: any): AgentToken {
    return {
      id: dbToken.id,
      user_id: dbToken.user_id,
      twin_id: dbToken.twin_id,
      name: dbToken.name,
      token: '', // Never return the actual token, only hash is stored
      permissions: {
        read: dbToken.permission_read,
        post: dbToken.permission_post,
        chat: dbToken.permission_chat,
      },
      expires_at: dbToken.expires_at,
      is_active: dbToken.is_active,
      created_at: dbToken.created_at,
      last_used_at: dbToken.last_used_at,
    };
  }
}
```

---

## Task 4: Digital Twin Service

**Files:**
- Create: `/workspace/src/services/digitalTwinService.ts`

Service for managing digital twins:

```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DigitalTwin } from '../types';

export class DigitalTwinService {
  // Create digital twin
  static async createTwin(params: {
    userId: string;
    name: string;
    avatar: string;
    bio: string;
    personalitySignature: string;
  }): Promise<DigitalTwin | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('digital_twins')
        .insert({
          user_id: params.userId,
          name: params.name,
          avatar: params.avatar,
          bio: params.bio,
          personality_signature: params.personalitySignature,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create digital twin:', error);
        return null;
      }

      return this.transformDBTwinToTwin(data);
    } catch (error) {
      console.error('Error creating digital twin:', error);
      return null;
    }
  }

  // Get user's digital twins
  static async getUserTwins(userId: string): Promise<DigitalTwin[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('digital_twins')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get user twins:', error);
        return [];
      }

      return (data || []).map(this.transformDBTwinToTwin);
    } catch (error) {
      console.error('Error getting user twins:', error);
      return [];
    }
  }

  // Get twin by ID
  static async getTwinById(twinId: string): Promise<DigitalTwin | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('digital_twins')
        .select('*')
        .eq('id', twinId)
        .single();

      if (error) {
        console.error('Failed to get twin:', error);
        return null;
      }

      return this.transformDBTwinToTwin(data);
    } catch (error) {
      console.error('Error getting twin:', error);
      return null;
    }
  }

  // Update digital twin
  static async updateTwin(twinId: string, userId: string, updates: Partial<{
    name?: string;
    avatar?: string;
    bio?: string;
    personalitySignature?: string;
  }>): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('digital_twins')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          bio: updates.bio,
          personality_signature: updates.personalitySignature,
          updated_at: new Date().toISOString(),
        })
        .eq('id', twinId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update twin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating twin:', error);
      return false;
    }
  }

  // Deactivate digital twin
  static async deactivateTwin(twinId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('digital_twins')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', twinId)
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to deactivate twin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deactivating twin:', error);
      return false;
    }
  }

  private static transformDBTwinToTwin(dbTwin: any): DigitalTwin {
    return {
      id: dbTwin.id,
      user_id: dbTwin.user_id,
      name: dbTwin.name,
      avatar: dbTwin.avatar,
      bio: dbTwin.bio,
      personality_signature: dbTwin.personality_signature,
      created_at: dbTwin.created_at,
      updated_at: dbTwin.updated_at,
      is_active: dbTwin.is_active,
    };
  }
}
```

---

## Task 5: Rate Limiting Service

**Files:**
- Create: `/workspace/src/services/rateLimitService.ts`

Client-side rate limit check (server will also enforce):

```typescript
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const RATE_LIMITS = {
  post: { interval: 10 * 60 * 1000, max: 1 }, // 1 post per 10 mins
  chat: { interval: 3 * 1000, max: 1 }, // 1 message per 3s
};

export class RateLimitService {
  // Check if action is allowed (client-side preview)
  static async checkRateLimit(twinId: string, actionType: 'post' | 'chat'): Promise<{ allowed: boolean; waitTime?: number }> {
    if (!isSupabaseConfigured) {
      // If no Supabase, use local storage check
      return this.checkLocalRateLimit(twinId, actionType);
    }

    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - RATE_LIMITS[actionType].interval);

      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('*')
        .eq('twin_id', twinId)
        .eq('action_type', actionType)
        .gte('action_at', windowStart.toISOString())
        .order('action_at', { ascending: false });

      if (error) {
        console.error('Failed to check rate limit:', error);
        return this.checkLocalRateLimit(twinId, actionType);
      }

      if ((data || []).length;

      if ((data || []).length >= RATE_LIMITS[actionType].max && data[0].action_at) {
        const lastAction = new Date(data[0].action_at);
        const waitTime = RATE_LIMITS[actionType].interval - (now.getTime() - lastAction.getTime());
        return { allowed: false, waitTime };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return this.checkLocalRateLimit(twinId, actionType);
    }
  }

  // Local fallback rate limit check
  private static checkLocalRateLimit(twinId: string, actionType: 'post' | 'chat'): { allowed: boolean; waitTime?: number } {
    if (typeof window === 'undefined') return { allowed: true };

    const localStorageKey = `rate_limit_${twinId}_${actionType}`;
    const lastActionStr = localStorage.getItem(localStorageKey);

    if (!lastActionStr) {
      return { allowed: true };
    }

    const lastAction = new Date(lastActionStr);
    const now = new Date();
    const timePassed = now.getTime() - lastAction.getTime();

    if (timePassed < RATE_LIMITS[actionType].interval) {
      return { allowed: false, waitTime: RATE_LIMITS[actionType].interval - timePassed };
    }

    return { allowed: true };
  }

  // Log action (both local and server)
  static async logAction(twinId: string, actionType: 'post' | 'chat'): Promise<void> {
    // Local log
    if (typeof window !== 'undefined') {
      const localStorageKey = `rate_limit_${twinId}_${actionType}`;
      localStorage.setItem(localStorageKey, new Date().toISOString());
    }

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('rate_limit_logs').insert({
        twin_id: twinId,
        action_type: actionType,
      });
    } catch (error) {
      console.error('Failed to log rate limit action:', error);
    }
  }
}
```

---

## Task 6: External AI Integration Screen

**Files:**
- Create: `/workspace/src/components/screens/ExternalAiIntegrationScreen.tsx`

Main page for managing tokens and digital twins:

```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Copy, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { AgentToken, DigitalTwin } from '../../types';
import { AgentTokenService } from '../../services/agentTokenService';
import { DigitalTwinService } from '../../services/digitalTwinService';

interface ExternalAiIntegrationScreenProps {
  onBack: () => void;
  onTwinDetail: (twinId: string) => void;
  onCreateTwin: () => void;
  currentUserId: string | null;
}

export function ExternalAiIntegrationScreen({ 
  onBack, onTwinDetail, onCreateTwin, currentUserId
}: ExternalAiIntegrationScreenProps) {
  const [twins, setTwins] = useState<DigitalTwin[]>([]);
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [selectedTwin, setSelectedTwin] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenPermissions, setNewTokenPermissions] = useState({ read: true, post: true, chat: true });
  const [showNewToken, setShowNewToken] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && loadData());
  }, [currentUserId]);

  const loadData = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const [userTwins = await DigitalTwinService.getUserTwins(currentUserId);
      const userTokens = await AgentTokenService.getUserTokens(currentUserId);
      setTwins(userTwins);
      setTokens(userTokens);
      if (userTwins.length > 0 && !selectedTwin) {
        setSelectedTwin(userTwins[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!currentUserId || !selectedTwin || !newTokenName) return;
    setLoading(true);
    try {
      const result = await AgentTokenService.createToken({
        userId: currentUserId,
        twinId: selectedTwin,
        name: newTokenName,
        permissions: newTokenPermissions,
      });
      if (result) {
        setCreatedToken(result.token);
        setShowNewToken(true);
        setNewTokenName('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (!currentUserId) return;
    const success = await AgentTokenService.revokeToken(tokenId, currentUserId);
    if (success) {
      loadData();
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!currentUserId) return;
    const success = await AgentTokenService.deleteToken(tokenId, currentUserId);
    if (success) {
      loadData();
    }
  };

  const selectedTwinData = twins.find(t => t.id === selectedTwin);
  const twinTokens = tokens.filter(t => t.twin_id === selectedTwin);

  return (
    <div className="min-h-screen bg-background text-on-surface p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">外部AI接入</h1>
            <p className="text-on-surface-variant mt-1">管理数字孪生和AI访问令牌</p>
          </div>
        </div>

        {/* Security Warning */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-red-800 mb-2">⚠️ 安全警告</h3>
              <p className="text-red-700 text-sm leading-relaxed">
                任何配置了该Token的AI工具都可以以你的数字孪生身份操作App——包括发帖、聊天、阅读内容。请务必妥善保管Token，不要分享给不信任的AI。因Token泄露造成的一切后果由用户自行负责。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Create Digital Twin Button */}
        {twins.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <button
              onClick={onCreateTwin}
              className="w-full bg-primary text-on-primary py-4 px-6 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              创建你的第一个数字孪生
            </button>
          </motion.div>
        )}

        {twins.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Digital Twins Sidebar */}
            <div className="space-y-4">
              <h2 className="font-bold text-lg">数字孪生</h2>
              <div className="space-y-2">
                {twins.map(twin => (
                <button
                  key={twin.id}
                  onClick={() => setSelectedTwin(twin.id)}
                  onDoubleClick={() => onTwinDetail(twin.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedTwin === twin.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-variant hover:bg-surface-variant/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={twin.avatar} alt={twin.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{twin.name}</div>
                      <div className="text-xs opacity-80 truncate">{twin.bio}</div>
                    </div>
                  </div>
                </button>
              ))}
              </div>
              <button
                onClick={onCreateTwin}
                className="w-full border-2 border-dashed border-outline p-4 rounded-xl hover:bg-surface-variant/50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                新建数字孪生
              </button>
            </div>

            {/* Token Management */}
            <div className="md:col-span-2 space-y-6">
              {selectedTwinData && (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">
                      {selectedTwinData.name} 的访问令牌
                    </h2>
                    <button
                      onClick={() => setShowNewToken(!showNewToken)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-colors flex items-center gap-2"
                    >
                      <Plus size={18} />
                      生成新Token
                    </button>
                  </div>

                  {/* Create New Token */}
                  {showNewToken && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-surface-variant/50 rounded-xl p-6 space-y-4"
                    >
                      {createdToken ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-medium mb-2">✅ Token创建成功！请立即复制保存，之后无法再次查看！</p>
                            <div className="bg-green-100 p-3 rounded font-mono text-sm break-all">
                              {createdToken}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCopyToken}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Copy size={18} />
                              复制Token
                            </button>
                            <button
                              onClick={() => { setCreatedToken(null); setShowNewToken(false); }}
                              className="px-4 py-2 border border-outline rounded-lg hover:bg-surface-variant transition-colors"
                            >
                              完成
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Token名称</label>
                            <input
                              type="text"
                              value={newTokenName}
                              onChange={(e) => setNewTokenName(e.target.value)}
                              placeholder="例如：OpenClaw 机器人"
                              className="w-full px-4 py-2 bg-surface border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">权限配置</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newTokenPermissions.read}
                                  onChange={(e) => setNewTokenPermissions(prev => ({ ...prev, read: e.target.checked }))}
                                  className="rounded"
                                />
                                阅读内容
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newTokenPermissions.post}
                                  onChange={(e) => setNewTokenPermissions(prev => ({ ...prev, post: e.target.checked }))}
                                  className="rounded"
                                />
                                发布帖子（10分钟内最多1次）
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newTokenPermissions.chat}
                                  onChange={(e) => setNewTokenPermissions(prev => ({ ...prev, chat: e.target.checked }))}
                                  className="rounded"
                                />
                                发送消息（间隔不少于3秒）
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCreateToken}
                              disabled={loading || !newTokenName}
                              className="flex-1 bg-primary text-on-primary py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50"
                            >
                              生成Token
                            </button>
                            <button
                              onClick={() => setShowNewToken(false)}
                              className="px-4 py-2 border border-outline rounded-lg hover:bg-surface-variant transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Token List */}
                  <div className="space-y-3">
                    {twinTokens.length === 0 ? (
                      <div className="text-center py-12 text-on-surface-variant">
                        暂无访问令牌，创建一个开始使用
                      </div>
                    ) : (
                      twinTokens.map(token => (
                        <div key={token.id} className="bg-surface-variant/50 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{token.name}</h3>
                                {!token.is_active && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">已撤销</span>
                                )}
                              </div>
                              <div className="text-sm text-on-surface-variant space-y-1">
                                <div className="flex gap-2 text-xs">
                                  {token.permissions.read && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">阅读</span>}
                                  {token.permissions.post && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">发帖</span>}
                                  {token.permissions.chat && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">聊天</span>}
                                </div>
                                <div>创建于：{new Date(token.created_at).toLocaleDateString('zh-CN')}</div>
                                {token.last_used_at && (
                                  <div>最近使用：{new Date(token.last_used_at).toLocaleString('zh-CN')}</div>
                                )}
                                {token.expires_at && (
                                  <div>过期时间：{new Date(token.expires_at).toLocaleString('zh-CN')}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {token.is_active && (
                                <button
                                  onClick={() => handleRevokeToken(token.id)}
                                  className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="撤销Token"
                                >
                                  <Eye size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteToken(token.id)}
                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="删除Token"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Task 7: Digital Twin Create Screen

**Files:**
- Create: `/workspace/src/components/screens/DigitalTwinCreateScreen.tsx`

Screen to create new digital twins:

```tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload } from 'lucide-react';
import { DigitalTwinService } from '../../services/digitalTwinService';

interface DigitalTwinCreateScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  currentUserId: string | null;
}

export function DigitalTwinCreateScreen({ onBack, onSuccess, currentUserId }: DigitalTwinCreateScreenProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [personalitySignature, setPersonalitySignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!currentUserId || !name) return;

    // Generate default avatar if not provided
    const finalAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`;

    setLoading(true);
    try {
      const result = await DigitalTwinService.createTwin({
        userId: currentUserId,
        name,
        avatar: finalAvatar,
        bio,
        personalitySignature,
      });

      if (result) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create twin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-variant rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">创建数字孪生</h1>
            <p className="text-on-surface-variant mt-1">为你的AI分身设置独立身份</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=default`}
                alt="Twin Avatar"
                className="w-32 h-32 rounded-full object-cover bg-surface-variant"
              />
              <button
                onClick={() => {
                  // Simple avatar selection - in real app, integrate file upload
                  setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`);
                }}
                className="absolute -bottom-2 -right-2 p-2 bg-primary text-on-primary rounded-full shadow-lg hover:opacity-90 transition-all"
              >
                <Upload size={20} />
              </button>
            </div>
            <p className="text-sm text-on-surface-variant">点击更换头像</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">孪生体名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：我的AI助手"
              className="w-full px-4 py-3 bg-surface border border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">简介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="描述一下这个数字孪生体..."
              rows={3}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Personality Signature */}
          <div>
            <label className="block text-sm font-medium mb-2">人格签名</label>
            <textarea
              value={personalitySignature}
              onChange={(e) => setPersonalitySignature(e.target.value)}
              placeholder="定义这个数字孪生的性格、说话风格、行为模式等，外部AI会参考这个签名来塑造行为..."
              rows={6}
              className="w-full px-4 py-3 bg-surface border border-outline rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
            />
            <p className="text-xs text-on-surface-variant mt-2">
              提示：越详细的人格签名，AI的行为越符合你的预期。你可以描述性格特点、说话方式、兴趣爱好等。
            </p>
          </div>

          {/* Create Button */}
          <div className="pt-4">
            <button
              onClick={handleCreate}
              disabled={loading || !name}
              className="w-full bg-primary text-on-primary py-4 px-6 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '创建中...' : '创建数字孪生'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

---

## Task 8: Digital Twin Detail Screen

**Files:**
- Create: `/workspace/src/components/screens/DigitalTwinDetailScreen.tsx`

Screen to view and manage a specific digital twin:

```tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Settings } from 'lucide-react';
import { DigitalTwin } from '../../types';
import { DigitalTwinService } from '../../services/digitalTwinService';
import { PostService } from '../../services/postService';
import { Post } from '../../types';

interface DigitalTwinDetailScreenProps {
  twinId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function DigitalTwinDetailScreen({ twinId, onBack, onEdit }: DigitalTwinDetailScreenProps) {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [twinPosts, setTwinPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTwinData();
  }, [twinId]);

  const loadTwinData = async () => {
    setLoading(true);
    try {
      const twinData = await DigitalTwinService.getTwinById(twinId);
      setTwin(twinData);
      
      // In a real implementation, you'd fetch posts by this twin
      // For now, we'll use an empty array
      setTwinPosts([]);
    } catch (error) {
      console.error('Failed to load twin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">未找到该数字孪生</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="absolute -bottom-0 left-0 right-0 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-4">
              <img
                src={twin.avatar}
                alt={twin.name}
                className="w-24 h-24 rounded-full border-4 border-background shadow-lg"
              />
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{twin.name}</h1>
                    <p className="text-on-surface-variant mt-1">{twin.bio}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={onEdit}
                      className="p-2 bg-surface-variant hover:bg-surface-variant/80 rounded-full transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      className="p-2 bg-surface-variant hover:bg-surface-variant/80 rounded-full transition-colors"
                    >
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        {/* Personality Signature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-surface-variant/50 rounded-xl p-6"
        >
          <h2 className="font-bold text-lg mb-3">人格签名</h2>
          <div className="font-mono text-sm text-on-surface-variant whitespace-pre-wrap">
            {twin.personality_signature || '暂无签名'}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">活动轨迹</h2>
          {twinPosts.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant bg-surface-variant/30 rounded-xl">
              暂无活动记录
            </div>
          ) : (
            <div className="space-y-4">
              {/* Posts would go here */}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-variant/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-on-surface-variant">帖子</div>
          </div>
          <div className="bg-surface-variant/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-on-surface-variant">消息</div>
          </div>
          <div className="bg-surface-variant/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {new Date(twin.created_at).toLocaleDateString('zh-CN')}
            </div>
            <div className="text-sm text-on-surface-variant">创建于</div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 9: Update App.tsx with New Routes

**Files:**
- Modify: `/workspace/src/App.tsx`

Integrate new screens and update navigation:

Add these imports:

```tsx
// Add to imports
import { ExternalAiIntegrationScreen } from './components/screens/ExternalAiIntegrationScreen';
import { DigitalTwinCreateScreen } from './components/screens/DigitalTwinCreateScreen';
import { DigitalTwinDetailScreen } from './components/screens/DigitalTwinDetailScreen';
```

Add these state variables:

```tsx
const [currentView, setCurrentView] = useState<AppView | 'external-ai' | 'create-twin' | 'twin-detail'>('login');
const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
```

Update the navigation in the SideNavigation component (add External AI menu item), and add these view handlers in the render:

```tsx
{currentView === 'external-ai' && (
  <ExternalAiIntegrationScreen
    onBack={() => setCurrentView('main')}
    onTwinDetail={(twinId) => { setSelectedTwinId(twinId); setCurrentView('twin-detail'); }}
    onCreateTwin={() => setCurrentView('create-twin')}
    currentUserId={currentUserId}
  />
)}

{currentView === 'create-twin' && (
  <DigitalTwinCreateScreen
    onBack={() => setCurrentView('external-ai')}
    onSuccess={() => setCurrentView('external-ai')}
    currentUserId={currentUserId}
  />
)}

{currentView === 'twin-detail' && selectedTwinId && (
  <DigitalTwinDetailScreen
    twinId={selectedTwinId}
    onBack={() => setCurrentView('external-ai')}
    onEdit={() => { /* TODO: Implement edit screen */ }}
  />
)}
```

Also add an "External AI" button in the SideNavigation or MeScreen to navigate to the external AI page.

---

## Task 10: Express Server Setup

**Files:**
- Create: `/workspace/server/index.ts`
- Create: `/workspace/server/routes/auth.ts`
- Create: `/workspace/server/routes/posts.ts`
- Create: `/workspace/server/routes/messages.ts`
- Create: `/workspace/server/middleware/rateLimit.ts`
- Create: `/workspace/server/middleware/security.ts`
- Modify: `/workspace/package.json` (add server scripts)
- Modify: `/workspace/vite.config.ts` (proxy to server)

First, let's create the main server file:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes will be added here

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`📡 API Documentation will be at /api-docs`);
});

export { app, supabase };
```

Now the security middleware (`server/middleware/security.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Token validation middleware
const TOKEN_PREFIX = 'tkn_';

export function validateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'missing_token',
        message: 'Missing or invalid Authorization header'
      }
    });
  }

  const token = authHeader.substring('Bearer '.length);
  
  if (!token.startsWith(TOKEN_PREFIX)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'invalid_token',
        message: 'Invalid token format'
      }
    });
  }

  // We'll validate the token against Supabase in the route handlers
  req.token = token;
  next();
}

// CORS and security headers
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}
```

Rate limiting middleware (`server/middleware/rateLimit.ts`):

```typescript
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

const RATE_LIMITS = {
  post: { interval: 10 * 60 * 1000, max: 1 },
  chat: { interval: 3 * 1000, max: 1 },
};

export function checkRateLimit(actionType: 'post' | 'chat') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const twinId = req.twin?.id;
    
    if (!twinId) {
      return next();
    }

    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - RATE_LIMITS[actionType].interval);

      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('*')
        .eq('twin_id', twinId)
        .eq('action_type', actionType)
        .gte('action_at', windowStart.toISOString())
        .order('action_at', { ascending: false });

      if (error) {
        console.error('Rate limit check error:', error);
        return next();
      }

      if ((data || []).length >= RATE_LIMITS[actionType].max) {
        const lastAction = new Date(data[0].action_at);
        const waitTime = Math.ceil((RATE_LIMITS[actionType].interval - (now.getTime() - lastAction.getTime()) / 1000);
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'rate_limit_exceeded',
            message: `Rate limit exceeded. Please wait ${waitTime} seconds.`
          }
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
}

export async function logRateLimitAction(twinId: string, actionType: 'post' | 'chat') {
  try {
    await supabase.from('rate_limit_logs').insert({
      twin_id: twinId,
      action_type: actionType,
    });
  } catch (error) {
    console.error('Failed to log rate limit action:', error);
  }
}
```

Auth routes (`server/routes/auth.ts`):

```typescript
import { Router } from 'express';
import { validateToken } from '../middleware/security';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const router = Router();
const TOKEN_PREFIX = 'tkn_';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Middleware to extract and validate token
router.use(validateToken);

// Validate token and get twin info
router.get('/validate', async (req, res) => {
  try {
    const tokenHash = hashToken(req.token);
    
    const { data, error } = await supabase
      .from('agent_tokens')
      .select(`
        *,
        twin:digital_twins(*)
      `)
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: { code: 'invalid_token', message: 'Invalid or expired token' }
      });
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: { code: 'token_expired', message: 'Token has expired' }
      });
    }

    // Update last used
    await supabase
      .from('agent_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    res.json({
      success: true,
      data: {
        twin: {
          id: data.twin.id,
          name: data.twin.name,
          avatar: data.twin.avatar,
          bio: data.twin.bio,
        },
        permissions: {
          read: data.permission_read,
          post: data.permission_post,
          chat: data.permission_chat,
        },
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

export default router;
```

Posts API routes (`server/routes/posts.ts`):

```typescript
import { Router, Request, Response } from 'express';
import { validateToken } from '../middleware/security';
import { checkRateLimit, logRateLimitAction } from '../middleware/rateLimit';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const router = Router();
const TOKEN_PREFIX = 'tkn_';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Middleware pipeline: validate token, check permissions
async function authAndCheckPermission(permission: 'read' | 'post' | 'chat') {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const tokenHash = hashToken(req.token);
      
      const { data, error } = await supabase
        .from('agent_tokens')
        .select(`*, twin:digital_twins(*)`)
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return res.status(401).json({ success: false, error: { code: 'invalid_token' } });
      }

      // Check specific permission
      const permissionKey = `permission_${permission}`;
      if (!data[permissionKey]) {
        return res.status(403).json({
          success: false,
          error: { code: 'permission_denied', message: `Permission '${permission}' required` }
        });
      }

      req.twin = data.twin;
      req.tokenData = data;
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'server_error' } });
    }
  };
}

// Create post
router.post(
  '/',
  validateToken,
  authAndCheckPermission('post'),
  checkRateLimit('post'),
  async (req: Request, res: Response) => {
    try {
      const { content, image_url } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          error: { code: 'missing_content', message: 'Content is required' }
        });
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: req.twin.user_id,
          twin_id: req.twin.id,
          content,
          image_url,
          author_data: {
            id: req.twin.id,
            name: req.twin.name,
            avatar: req.twin.avatar,
            isAgent: true,
          },
          likes_count: 0,
          comments_count: 0,
          is_ai_post: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Create post error:', error);
        return res.status(500).json({
          success: false,
          error: { code: 'create_failed', message: 'Failed to create post' }
        });
      }

      // Log the action for rate limiting
      await logRateLimitAction(req.twin.id, 'post');

      res.json({
        success: true,
        data: { id: data.id, created_at: data.created_at }
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Internal server error' }
      });
    }
  }
);

// Get posts (read permission)
router.get(
  '/',
  validateToken,
  authAndCheckPermission('read'),
  async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return res.status(500).json({
          success: false,
          error: { code: 'fetch_failed', message: 'Failed to fetch posts' }
        });
      }

      res.json({ success: true, data: data || [] });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { code: 'server_error' }
      });
    }
  }
);

export default router;
```

Messages API routes (`server/routes/messages.ts`):

```typescript
import { Router, Request, Response } from 'express';
import { validateToken } from '../middleware/security';
import { checkRateLimit, logRateLimitAction } from '../middleware/rateLimit';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const router = Router();
const TOKEN_PREFIX = 'tkn_';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function authAndCheckPermission(permission: 'read' | 'post' | 'chat') {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const tokenHash = hashToken(req.token);
      
      const { data, error } = await supabase
        .from('agent_tokens')
        .select(`*, twin:digital_twins(*)`)
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return res.status(401).json