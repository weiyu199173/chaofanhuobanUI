import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AgentToken } from '../types';

export class AgentTokenService {
  private static readonly TOKEN_PREFIX = 'tkn_';

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const randomPart = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `${this.TOKEN_PREFIX}${randomPart}`;
  }

  static async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static async createToken(
    userId: string,
    twinId: string,
    name: string,
    permissions: { read: boolean; post: boolean; chat: boolean } = { read: true, post: false, chat: false },
    expiresInDays: number = 30
  ): Promise<AgentToken | null> {
    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，无法创建令牌');
      return null;
    }

    try {
      const token = this.generateToken();
      const hashedToken = await this.hashToken(token);
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('agent_tokens')
        .insert({
          user_id: userId,
          twin_id: twinId,
          name,
          token: hashedToken,
          permissions,
          expires_at: expiresAt,
          is_active: true,
        })
        .select('*')
        .single();

      if (error) {
        console.error('创建令牌失败:', error);
        return null;
      }

      return { ...data, token } as AgentToken;
    } catch (error) {
      console.error('创建令牌出错:', error);
      return null;
    }
  }

  static async getUserTokens(userId: string): Promise<AgentToken[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('agent_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取用户令牌失败:', error);
        return [];
      }

      return data as AgentToken[];
    } catch (error) {
      console.error('获取用户令牌出错:', error);
      return [];
    }
  }

  static async revokeToken(tokenId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('agent_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) {
        console.error('撤销令牌失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('撤销令牌出错:', error);
      return false;
    }
  }

  static async deleteToken(tokenId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('agent_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) {
        console.error('删除令牌失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除令牌出错:', error);
      return false;
    }
  }

  static async validateToken(tokenString: string): Promise<AgentToken | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const hashedToken = await this.hashToken(tokenString);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('agent_tokens')
        .select('*')
        .eq('token', hashedToken)
        .eq('is_active', true)
        .gt('expires_at', now)
        .single();

      if (error || !data) {
        console.error('验证令牌失败:', error);
        return null;
      }

      await this.updateLastUsed(data.id);

      return data as AgentToken;
    } catch (error) {
      console.error('验证令牌出错:', error);
      return null;
    }
  }

  static async updateLastUsed(tokenId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      await supabase
        .from('agent_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', tokenId);
    } catch (error) {
      console.error('更新最后使用时间出错:', error);
    }
  }
}
