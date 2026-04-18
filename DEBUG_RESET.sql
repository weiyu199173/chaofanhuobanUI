-- ====================================================
-- 🔧 Transcend 数据库诊断与重置脚本
-- ====================================================
-- 使用方法：在 Supabase SQL Editor 中执行此脚本

-- ====================================================
-- 第一步：重置 users 表（谨慎使用！）
-- ====================================================
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nickname VARCHAR(100) NOT NULL,
    avatar TEXT,
    bio TEXT,
    full_bio TEXT,
    gender VARCHAR(10),
    phone VARCHAR(20),
    accountId VARCHAR(50),
    region VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ⚠️ 简化的 RLS 策略（允许所有已认证用户的所有操作）
-- 这用于诊断，之后可以替换为更严格的策略
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.users;
CREATE POLICY "Enable all for authenticated users" 
    ON public.users 
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);

-- ====================================================
-- 第二步：验证数据库状态
-- ====================================================
SELECT '✅ users 表已创建' AS status;

-- 显示所有认证用户（用于调试）
SELECT id, email, created_at FROM auth.users LIMIT 10;

-- ====================================================
-- 第三步：测试插入（如果你有一个测试用户 ID）
-- ====================================================
-- 替换下面的 'your-user-id-here' 为实际的用户 ID 进行测试
-- INSERT INTO public.users (id, nickname, avatar, bio) 
-- VALUES (
--     'your-user-id-here', 
--     '测试用户', 
--     'https://api.dicebear.com/7.x/bottts/svg?seed=test', 
--     '这是一个测试用户'
-- );

-- 验证数据
-- SELECT * FROM public.users;
