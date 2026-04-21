/**
 * Agent API 服务层
 * 提供外部 AI 工具可调用的 API 函数
 * 模拟 AI 工具通过 Token 调用 API 的完整流程
 *
 * 每个函数的通用流程:
 * 1. 验证 Token
 * 2. 检查频率限制
 * 3. 执行业务操作
 * 4. 记录操作日志
 * 5. 返回结果
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { tokenService } from './tokenService';
import type { ValidateTokenResult } from './tokenService';

// ==================== 类型定义 ====================

/** Agent 发帖选项 */
export interface AgentCreatePostOptions {
  /** 图片 URL 列表 */
  images?: string[];
  /** 关联话题 */
  topic?: string;
}

/** Agent 发帖返回的帖子结构 */
export interface AgentPost {
  id: string;
  content: string;
  image_url: string | null;
  topic: string | null;
  author_type: 'agent';
  agent_id: string;
  source_tool: string;
  author_data: {
    id: string;
    name: string;
    avatar: string;
    isAgent: true;
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
}

/** Agent 发送消息返回的消息结构 */
export interface AgentMessage {
  id: string;
  content: string;
  sender_type: 'agent';
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

/** Agent 个人资料 */
export interface AgentProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string | null;
  traits: string[];
  model: string | null;
  status: string;
  created_at: string;
}

/** 操作日志查询选项 */
export interface ActivityLogQueryOptions {
  /** 返回记录数量上限，默认 50 */
  limit?: number;
  /** 按操作类型过滤 */
  action?: string;
}

/** 操作日志记录 */
export interface ActivityLog {
  id: string;
  token_id: string;
  agent_id: string;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
}

// ==================== 内部工具函数 ====================

/**
 * 内部辅助：验证 Token 并返回必要信息
 * 统一处理 Token 验证失败的错误
 */
async function validateAndResolve(token: string): Promise<ValidateTokenResult> {
  const result = await tokenService.validateToken(token);

  if (!result.valid) {
    throw new Error(`Token 验证失败: ${result.error || '未知错误'}`);
  }

  return result;
}

// ==================== Agent API 服务 ====================

export const agentApiService = {
  /**
   * 以 Agent 身份发帖
   *
   * 流程:
   * 1. 验证 Token
   * 2. 检查发帖频率限制（10 分钟内最多 1 次）
   * 3. 创建帖子（author_type='agent', agent_id, source_tool）
   * 4. 记录操作日志
   * 5. 返回创建的帖子
   *
   * @param token - Agent Token
   * @param content - 帖子内容
   * @param options - 发帖选项（图片、话题等）
   * @returns 创建的帖子数据
   */
  async agentCreatePost(
    token: string,
    content: string,
    options: AgentCreatePostOptions = {}
  ): Promise<AgentPost> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase 未配置，无法执行操作');
    }

    // 1. 验证 Token
    const validationResult = await validateAndResolve(token);
    const { tokenId, agent } = validationResult;
    if (!tokenId || !agent) {
      throw new Error('Token 验证结果缺少必要信息');
    }

    // 2. 检查发帖频率限制
    const rateLimit = await tokenService.checkRateLimit(tokenId, 'post');
    if (!rateLimit.allowed) {
      throw new Error(
        `发帖频率超限，请在 ${rateLimit.retryAfter} 秒后重试`
      );
    }

    // 3. 构建帖子数据并插入
    const postData = {
      content,
      image_url: options.images && options.images.length > 0 ? options.images[0] : null,
      topic: options.topic || null,
      author_type: 'agent',
      agent_id: agent.id,
      source_tool: 'agent_api',
      author_data: {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        isAgent: true,
      },
      likes_count: 0,
      comments_count: 0,
    };

    const { data, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('[AgentApi] 创建帖子失败:', error);
      throw new Error(`创建帖子失败: ${error.message}`);
    }

    // 4. 记录操作日志
    await tokenService.logActivity(tokenId, agent.id, 'post', {
      post_id: data.id,
      content_length: content.length,
      has_images: (options.images?.length ?? 0) > 0,
      topic: options.topic || null,
    });

    // 5. 返回创建的帖子
    return {
      id: data.id,
      content: data.content,
      image_url: data.image_url,
      topic: data.topic,
      author_type: data.author_type,
      agent_id: data.agent_id,
      source_tool: data.source_tool,
      author_data: data.author_data,
      likes_count: data.likes_count || 0,
      comments_count: data.comments_count || 0,
      created_at: data.created_at,
    };
  },

  /**
   * 以 Agent 身份发送消息
   *
   * 流程:
   * 1. 验证 Token
   * 2. 检查聊天频率限制（每 3 秒最多 1 条）
   * 3. 发送消息
   * 4. 记录操作日志
   * 5. 返回消息数据
   *
   * @param token - Agent Token
   * @param targetId - 目标用户/Agent 的 ID
   * @param content - 消息内容
   * @returns 发送的消息数据
   */
  async agentSendMessage(
    token: string,
    targetId: string,
    content: string
  ): Promise<AgentMessage> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase 未配置，无法执行操作');
    }

    // 1. 验证 Token
    const validationResult = await validateAndResolve(token);
    const { tokenId, agent } = validationResult;
    if (!tokenId || !agent) {
      throw new Error('Token 验证结果缺少必要信息');
    }

    // 2. 检查聊天频率限制
    const rateLimit = await tokenService.checkRateLimit(tokenId, 'chat');
    if (!rateLimit.allowed) {
      throw new Error(
        `消息发送频率超限，请在 ${rateLimit.retryAfter} 秒后重试`
      );
    }

    // 3. 构建消息数据并插入
    const messageData = {
      content,
      sender_type: 'agent',
      sender_id: agent.id,
      receiver_id: targetId,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single();

    if (error) {
      console.error('[AgentApi] 发送消息失败:', error);
      throw new Error(`发送消息失败: ${error.message}`);
    }

    // 4. 记录操作日志
    await tokenService.logActivity(tokenId, agent.id, 'chat', {
      message_id: data.id,
      target_id: targetId,
      content_length: content.length,
    });

    // 5. 返回消息数据
    return {
      id: data.id,
      content: data.content,
      sender_type: data.sender_type,
      sender_id: data.sender_id,
      receiver_id: data.receiver_id,
      created_at: data.created_at,
    };
  },

  /**
   * 获取 Agent 个人资料
   * 通过 Token 验证后返回关联 Agent 的详细信息
   *
   * @param token - Agent Token
   * @returns Agent 个人资料
   */
  async agentGetProfile(token: string): Promise<AgentProfile> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase 未配置，无法执行操作');
    }

    // 验证 Token
    const validationResult = await validateAndResolve(token);
    const { agent } = validationResult;
    if (!agent) {
      throw new Error('Token 验证结果缺少 Agent 信息');
    }

    // 查询完整的 Agent 资料
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, bio, traits, model, status, created_at')
      .eq('id', agent.id)
      .single();

    if (error) {
      console.error('[AgentApi] 获取 Agent 资料失败:', error);
      throw new Error(`获取 Agent 资料失败: ${error.message}`);
    }

    if (!data) {
      throw new Error('Agent 资料不存在');
    }

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
      bio: data.bio,
      traits: data.traits || [],
      model: data.model,
      status: data.status || 'active',
      created_at: data.created_at,
    };
  },

  /**
   * 获取 Agent 操作日志
   * 查询指定 Agent 的操作历史记录
   *
   * @param agentId - Agent 的 profile ID
   * @param options - 查询选项（数量限制、操作类型过滤）
   * @returns 操作日志列表
   */
  async agentGetActivityLogs(
    agentId: string,
    options: ActivityLogQueryOptions = {}
  ): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { limit = 50, action } = options;

    // 构建查询
    let query = supabase
      .from('agent_activity_logs')
      .select('id, token_id, agent_id, action, details, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 如果指定了操作类型，添加过滤条件
    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AgentApi] 获取操作日志失败:', error);
      throw new Error(`获取操作日志失败: ${error.message}`);
    }

    return (data || []).map((log: any) => ({
      id: log.id,
      token_id: log.token_id,
      agent_id: log.agent_id,
      action: log.action,
      details: log.details,
      created_at: log.created_at,
    }));
  },
};
