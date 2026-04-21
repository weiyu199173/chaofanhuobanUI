/**
 * API Service 层 - 统一管理所有 Supabase 调用
 * 从组件中提取的 API 逻辑，统一错误处理
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, ContactProfile } from '../types';
import { tokenService } from './tokenService';
import { agentApiService } from './agentApiService';

// 重新导出 Token 服务和 Agent API 服务
export { tokenService } from './tokenService';
export { agentApiService } from './agentApiService';
export type {
  GenerateTokenOptions,
  GenerateTokenResult,
  ValidateTokenResult,
  TokenRecord,
  RateLimitResult,
  ActivityLogRecord,
} from './tokenService';
export type {
  AgentCreatePostOptions,
  AgentPost,
  AgentMessage,
  AgentProfile,
  ActivityLogQueryOptions,
  ActivityLog,
} from './agentApiService';

// ==================== 认证相关 ====================

export const authService = {
  /** 使用邮箱密码登录 */
  async loginWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return {
        user: {
          id: 'demo-user',
          email,
          user_metadata: { nickname: email.split('@')[0] },
        },
      };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  },

  /** 注册新账号 */
  async register(email: string, password: string, nickname: string) {
    if (!isSupabaseConfigured) {
      return {
        user: {
          id: 'demo-user-' + Date.now(),
          email,
          user_metadata: { nickname },
        },
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });
    if (error) throw error;
    return { user: data.user };
  },

  /** 退出登录 */
  async logout() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  /** 获取当前 session */
  async getSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** 获取当前用户 */
  async getUser() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /** 监听认证状态变化 */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };
    const { data } = supabase.auth.onAuthStateChange(callback);
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};

// ==================== 帖子相关 ====================

export const postService = {
  /** 获取所有帖子 */
  async fetchPosts(): Promise<Post[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
    if (!data) return [];

    return data.map((item: any) => ({
      id: item.id,
      author: item.author_data,
      content: item.content,
      time: new Date(item.created_at).toLocaleString('zh-CN', { hour12: false }),
      image: item.image_url,
      likes: item.likes_count || 0,
      comments: item.comments_count || 0,
      liked: false,
    }));
  },

  /** 创建新帖子 */
  async createPost(postData: {
    author_data: any;
    content: string;
    image_url?: string | null;
    user_id?: string;
  }): Promise<Post | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select();
    if (error) throw error;
    if (data && data[0]) {
      return {
        id: data[0].id,
        author: data[0].author_data,
        content: data[0].content,
        time: '刚刚',
        image: postData.image_url || undefined,
        likes: 0,
        comments: 0,
      };
    }
    return null;
  },

  /** 删除帖子 */
  async deletePost(id: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  },
};

// ==================== 用户档案 / Agent 相关 ====================

export const profileService = {
  /** 获取用户的所有 Agent 档案 */
  async fetchUserAgents(userId: string): Promise<ContactProfile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_agent', true);

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }
    if (!data) return [];

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isAgent: p.is_agent,
      type: p.type,
      status: p.status,
      lv: p.lv,
      syncRate: p.sync_rate,
      bio: p.bio,
      traits: p.traits || [],
      model: p.model,
      activeHooks: p.active_hooks || [],
      isFriend: true,
    }));
  },

  /** 创建 Agent 档案 */
  async createAgent(agentData: {
    id: string;
    user_id: string;
    name: string;
    avatar: string;
    is_agent: boolean;
    type: string;
    bio: string;
    traits: string[];
    model: string;
    active_hooks: string[];
  }) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('profiles').insert([agentData]);
    if (error) throw error;
  },

  /** 更新 Agent 档案 */
  async updateAgent(id: string, data: {
    name?: string;
    traits?: string[];
    active_hooks?: string[];
    model?: string;
  }) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('profiles').update(data).eq('id', id);
    if (error) throw error;
  },

  /** 删除 Agent 档案 */
  async deleteAgent(id: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },
};
