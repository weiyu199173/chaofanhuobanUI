import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 判断 Supabase 是否已正确配置
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co'
);

// 如果环境变量缺失，抛出明确错误提示开发者配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] 缺少必要的环境变量。请在 .env 文件中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。'
  );
}

// 使用占位符以防止未配置时初始化崩溃
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
