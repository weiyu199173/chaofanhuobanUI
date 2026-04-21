import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_PREFIX = 'transcend_rate_limit';

const RATE_LIMITS = {
  post: { interval: 10 * 60 * 1000, max: 1 },
  chat: { interval: 3 * 1000, max: 1 },
};

export class RateLimitService {
  // 获取本地存储键名
  private static getLocalStorageKey(twinId: string, actionType: 'post' | 'chat'): string {
    return `${LOCAL_STORAGE_PREFIX}_${twinId}_${actionType}`;
  }

  // 检查本地速率限制
  private static checkLocalRateLimit(twinId: string, actionType: 'post' | 'chat'): { allowed: boolean; waitTime?: number } {
    if (typeof window === 'undefined') return { allowed: true };

    const key = this.getLocalStorageKey(twinId, actionType);
    const lastActionStr = localStorage.getItem(key);

    if (!lastActionStr) {
      return { allowed: true };
    }

    const lastAction = new Date(lastActionStr);
    const now = new Date();
    const timePassed = now.getTime() - lastAction.getTime();

    if (timePassed < RATE_LIMITS[actionType].interval) {
      const waitTime = RATE_LIMITS[actionType].interval - timePassed;
      return { allowed: false, waitTime };
    }

    return { allowed: true };
  }

  // 检查操作是否允许
  static async checkRateLimit(twinId: string, actionType: 'post' | 'chat'): Promise<{ allowed: boolean; waitTime?: number }> {
    // 先检查本地
    const localCheck = this.checkLocalRateLimit(twinId, actionType);
    if (!localCheck.allowed) {
      return localCheck;
    }

    if (!isSupabaseConfigured) {
      return localCheck;
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
        console.error('检查速率限制失败:', error);
        return localCheck;
      }

      if ((data || []).length >= RATE_LIMITS[actionType].max) {
        const lastAction = new Date(data[0].action_at);
        const waitTime = RATE_LIMITS[actionType].interval - (now.getTime() - lastAction.getTime());
        return { allowed: false, waitTime };
      }

      return { allowed: true };
    } catch (error) {
      console.error('检查速率限制出错:', error);
      return localCheck;
    }
  }

  // 记录操作（本地+服务器）
  static async logAction(twinId: string, actionType: 'post' | 'chat'): Promise<void> {
    // 先记录到本地
    if (typeof window !== 'undefined') {
      const key = this.getLocalStorageKey(twinId, actionType);
      localStorage.setItem(key, new Date().toISOString());
    }

    if (!isSupabaseConfigured) return;

    try {
      await supabase.from('rate_limit_logs').insert({
        twin_id: twinId,
        action_type: actionType,
      });
    } catch (error) {
      console.error('记录速率限制日志失败:', error);
    }
  }

  // 格式化等待时间
  static formatWaitTime(waitTimeMs: number): string {
    const seconds = Math.ceil(waitTimeMs / 1000);
    const minutes = Math.ceil(seconds / 60);
    
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    return `${minutes}分钟`;
  }
}
