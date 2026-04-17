import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量。请设置 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 和 SUPABASE_ANON_KEY');
}

// Admin 客户端 - 使用 SERVICE_ROLE_KEY，绕过 RLS，用于管理操作
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon 客户端 - 使用 ANON_KEY，用于用户上下文操作
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
