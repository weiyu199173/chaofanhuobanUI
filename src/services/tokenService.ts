/**
 * Agent Token 服务层
 * 提供 Agent Token 的完整 CRUD 操作
 * - Token 生成（tp_ + 32位随机字符）
 * - Token 验证（SHA-256 哈希比对）
 * - Token 列表查询
 * - Token 禁用 / 删除
 * - 频率限制检查
 * - 操作日志记录
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ==================== 类型定义 ====================

/** Token 生成选项 */
export interface GenerateTokenOptions {
  /** Token 名称，便于识别 */
  name?: string;
  /** 权限配置 */
  permissions?: Record<string, any>;
  /** 过期时间（秒），默认 30 天 */
  expiresIn?: number;
}

/** Token 生成结果 */
export interface GenerateTokenResult {
  /** 完整 token（仅此一次展示，不会再次返回） */
  token: string;
  /** Token 前缀（tp_ + 前6位），用于列表展示 */
  tokenPrefix: string;
}

/** Token 验证结果 */
export interface ValidateTokenResult {
  /** 是否有效 */
  valid: boolean;
  /** 关联的 Agent 信息 */
  agent?: {
    id: string;
    name: string;
    avatar: string;
    user_id: string;
  };
  /** Token 记录 ID */
  tokenId?: string;
  /** 错误信息 */
  error?: string;
}

/** 数据库中的 Token 记录（不含完整 token） */
export interface TokenRecord {
  id: string;
  agent_id: string;
  name: string;
  token_prefix: string;
  permissions: Record<string, any>;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

/** 频率限制检查结果 */
export interface RateLimitResult {
  /** 是否允许操作 */
  allowed: boolean;
  /** 需要等待的秒数（仅在 allowed=false 时有值） */
  retryAfter?: number;
}

/** 操作日志记录 */
export interface ActivityLogRecord {
  id: string;
  token_id: string;
  agent_id: string;
  action: string;
  details: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ==================== 工具函数 ====================

/**
 * 计算 SHA-256 哈希
 * 使用 Web Crypto API 的 crypto.subtle.digest
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 生成随机十六进制字符串
 * @param length 字节数（最终字符串长度为 length * 2）
 */
function generateRandomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 将 ArrayBuffer 转换为十六进制字符串
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ==================== Token 服务 ====================

export const tokenService = {
  /**
   * 生成 Agent Token
   * 格式: tp_ + 32位随机十六进制字符（共 64 个十六进制字符）
   * 存储 SHA-256 哈希到 agent_tokens 表
   * 返回完整 token（仅此一次展示）
   *
   * @param agentId - Agent 的 profile ID
   * @param options - 生成选项
   * @returns 完整 token 和 token 前缀
   */
  async generateToken(
    agentId: string,
    options: GenerateTokenOptions = {}
  ): Promise<GenerateTokenResult> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase 未配置，无法生成 Token');
    }

    const { name = '默认 Token', permissions = {}, expiresIn = 30 * 24 * 3600 } = options;

    // 生成 token: tp_ + 32 字节随机十六进制 = tp_ + 64 个十六进制字符
    const rawToken = `tp_${generateRandomHex(32)}`;

    // 计算哈希用于存储
    const tokenHash = await sha256(rawToken);

    // 提取前缀用于展示（tp_ + 前6位）
    const tokenPrefix = rawToken.substring(0, 9); // tp_xxxxxxxx

    // 计算过期时间
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 存储到数据库（仅存储哈希，不存储明文）
    const { error } = await supabase.from('agent_tokens').insert([
      {
        agent_id: agentId,
        name,
        token_hash: tokenHash,
        token_prefix: tokenPrefix,
        permissions,
        is_active: true,
        expires_at: expiresAt,
      },
    ]);

    if (error) {
      console.error('[TokenService] 生成 Token 失败:', error);
      throw new Error(`生成 Token 失败: ${error.message}`);
    }

    return {
      token: rawToken,
      tokenPrefix,
    };
  },

  /**
   * 验证 Token
   * 计算 token 的 SHA-256 哈希，在 agent_tokens 表中查找
   * 检查 is_active 和 expires_at
   *
   * @param token - 完整的 token 字符串
   * @returns 验证结果和关联的 agent 信息
   */
  async validateToken(token: string): Promise<ValidateTokenResult> {
    if (!isSupabaseConfigured) {
      return { valid: false, error: 'Supabase 未配置' };
    }

    // 基本格式校验
    if (!token || !token.startsWith('tp_')) {
      return { valid: false, error: 'Token 格式无效' };
    }

    // 计算哈希
    const tokenHash = await sha256(token);

    // 在数据库中查找
    const { data: tokenData, error } = await supabase
      .from('agent_tokens')
      .select('id, agent_id, is_active, expires_at, permissions')
      .eq('token_hash', tokenHash)
      .single();

    if (error || !tokenData) {
      return { valid: false, error: 'Token 不存在' };
    }

    // 检查是否已禁用
    if (!tokenData.is_active) {
      return { valid: false, error: 'Token 已被禁用' };
    }

    // 检查是否过期
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return { valid: false, error: 'Token 已过期' };
    }

    // 查询关联的 Agent 信息
    const { data: agentData, error: agentError } = await supabase
      .from('profiles')
      .select('id, name, avatar, user_id')
      .eq('id', tokenData.agent_id)
      .single();

    if (agentError || !agentData) {
      return { valid: false, error: '关联的 Agent 不存在' };
    }

    // 更新最后使用时间
    await supabase
      .from('agent_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    return {
      valid: true,
      tokenId: tokenData.id,
      agent: {
        id: agentData.id,
        name: agentData.name,
        avatar: agentData.avatar,
        user_id: agentData.user_id,
      },
    };
  },

  /**
   * 获取指定 Agent 的所有 Token 列表
   * 仅显示前缀，不显示完整 token
   *
   * @param agentId - Agent 的 profile ID
   * @returns Token 记录列表
   */
  async fetchAgentTokens(agentId: string): Promise<TokenRecord[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error } = await supabase
      .from('agent_tokens')
      .select('id, agent_id, name, token_prefix, permissions, is_active, expires_at, last_used_at, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TokenService] 获取 Token 列表失败:', error);
      throw new Error(`获取 Token 列表失败: ${error.message}`);
    }

    return (data || []) as TokenRecord[];
  },

  /**
   * 禁用 Token
   * 将 is_active 设为 false，Token 不会被删除但无法再使用
   *
   * @param tokenId - Token 记录 ID
   */
  async deactivateToken(tokenId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('agent_tokens')
      .update({ is_active: false })
      .eq('id', tokenId);

    if (error) {
      console.error('[TokenService] 禁用 Token 失败:', error);
      throw new Error(`禁用 Token 失败: ${error.message}`);
    }
  },

  /**
   * 删除 Token
   * 从数据库中永久删除 Token 记录
   *
   * @param tokenId - Token 记录 ID
   */
  async deleteToken(tokenId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('agent_tokens')
      .delete()
      .eq('id', tokenId);

    if (error) {
      console.error('[TokenService] 删除 Token 失败:', error);
      throw new Error(`删除 Token 失败: ${error.message}`);
    }
  },

  /**
   * 检查频率限制
   * - 发帖 (post): 同一 Agent 10 分钟内最多 1 次
   * - 聊天 (chat): 同一 Agent 每 3 秒最多 1 条
   *
   * @param tokenId - Token 记录 ID
   * @param action - 操作类型
   * @returns 是否允许操作，以及需要等待的秒数
   */
  async checkRateLimit(
    tokenId: string,
    action: 'post' | 'chat'
  ): Promise<RateLimitResult> {
    if (!isSupabaseConfigured) {
      return { allowed: true };
    }

    // 先通过 tokenId 获取 agent_id
    const { data: tokenData, error: tokenError } = await supabase
      .from('agent_tokens')
      .select('agent_id')
      .eq('id', tokenId)
      .single();

    if (tokenError || !tokenData) {
      return { allowed: false, retryAfter: 0 };
    }

    const agentId = tokenData.agent_id;
    const now = new Date();

    // 根据操作类型确定时间窗口
    let windowSeconds: number;
    if (action === 'post') {
      windowSeconds = 10 * 60; // 10 分钟
    } else {
      windowSeconds = 3; // 3 秒
    }

    const windowStart = new Date(now.getTime() - windowSeconds * 1000).toISOString();

    // 查询时间窗口内的操作次数
    const { count, error: countError } = await supabase
      .from('agent_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('action', action)
      .gte('created_at', windowStart);

    if (countError) {
      console.error('[TokenService] 频率限制检查失败:', countError);
      // 出错时允许操作，避免因查询失败而阻塞
      return { allowed: true };
    }

    const maxRequests = 1;

    if (count !== null && count >= maxRequests) {
      // 计算最早一条记录的时间，得出需要等待多久
      const { data: earliestLog, error: earliestError } = await supabase
        .from('agent_activity_logs')
        .select('created_at')
        .eq('agent_id', agentId)
        .eq('action', action)
        .gte('created_at', windowStart)
        .order('created_at', { ascending: true })
        .limit(1);

      let retryAfter = windowSeconds;
      if (!earliestError && earliestLog && earliestLog.length > 0) {
        const earliestTime = new Date(earliestLog[0].created_at).getTime();
        const waitUntil = earliestTime + windowSeconds * 1000;
        retryAfter = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000));
      }

      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  },

  /**
   * 记录操作日志
   * 将操作记录写入 agent_activity_logs 表
   *
   * @param tokenId - Token 记录 ID
   * @param agentId - Agent 的 profile ID
   * @param action - 操作类型（如 'post', 'chat', 'login' 等）
   * @param details - 操作详情（可选）
   */
  async logActivity(
    tokenId: string,
    agentId: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('agent_activity_logs').insert([
      {
        token_id: tokenId,
        agent_id: agentId,
        action,
        details: details || null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('[TokenService] 记录操作日志失败:', error);
      // 日志记录失败不应阻塞主流程，仅打印警告
    }
  },
};
