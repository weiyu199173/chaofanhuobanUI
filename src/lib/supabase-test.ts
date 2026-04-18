/**
 * Supabase 连接测试工具
 * 用于验证数据库连接和实时功能是否正常工作
 */

import { supabase, isSupabaseConfigured } from './supabase';

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase 未配置 - 正在使用演示模式',
    };
  }

  try {
    // 测试 1: 基本连接
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.warn('Auth 测试:', authError.message);
    }

    // 测试 2: 查询数据库
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.warn('Posts 查询测试:', postsError.message);
      return {
        success: false,
        message: '可以连接 Supabase，但数据库可能还没有设置表',
        details: postsError,
      };
    }

    return {
      success: true,
      message: '✅ Supabase 连接成功！',
      details: {
        user: user ? '已登录' : '未登录',
        postsCount: posts?.length || 0,
      },
    };
  } catch (error) {
    console.error('Supabase 连接测试失败:', error);
    return {
      success: false,
      message: '❌ Supabase 连接失败',
      details: error,
    };
  }
}

export function subscribeToTestChannel(): () => void {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('test-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        console.log('📡 实时更新收到:', payload);
      }
    )
    .subscribe((status) => {
      console.log('🔌 Realtime 订阅状态:', status);
    });

  return () => {
    channel.unsubscribe();
  };
}

// 在控制台自动运行测试
if (typeof window !== 'undefined') {
  console.log('🔍 正在测试 Supabase 连接...');
  testSupabaseConnection().then((result) => {
    console.log(result.message);
    if (result.details) {
      console.log('详细信息:', result.details);
    }
  });
}
