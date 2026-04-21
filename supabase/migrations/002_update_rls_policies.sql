-- ============================================================
-- 002_update_rls_policies.sql
-- 更新现有表的 RLS 策略
-- 确保 agent 相关操作的安全隔离
-- ============================================================
-- 注意：此文件用于清理和更新现有 RLS 策略，解决与 001 迁移中
-- 新增策略可能产生的冲突，并完善安全隔离规则。
-- ============================================================

-- ============================================================
-- 第一部分：清理可能冲突的旧策略
-- ============================================================
-- 由于 SUPABASE_SCHEMA.sql 和 SUPABASE_SETUP.sql 中已定义了一些 RLS 策略，
-- 而 001_agent_token_system.sql 中也新增了部分策略，这里统一清理并重建。

-- -----------------------------------------------------------
-- posts 表：清理旧策略
-- -----------------------------------------------------------
-- 删除 SUPABASE_SCHEMA.sql 中定义的旧策略（如果存在）
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- 删除 SUPABASE_SETUP.sql 中定义的旧策略（如果存在）
DROP POLICY IF EXISTS "Posts are viewable by all authenticated users" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- 删除 001 迁移中可能创建的策略（统一重建）
DROP POLICY IF EXISTS "posts_select_all_viewable" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_human_or_agent_owner" ON public.posts;
DROP POLICY IF EXISTS "posts_update_author_or_agent_owner" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_author_or_agent_owner" ON public.posts;

-- -----------------------------------------------------------
-- profiles 表：清理旧策略
-- -----------------------------------------------------------
-- 删除 SUPABASE_SCHEMA.sql 中的旧策略
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 删除 SUPABASE_SETUP.sql 中的旧策略
DROP POLICY IF EXISTS "Public profiles are viewable by all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can edit their own profiles" ON public.profiles;

-- 删除 001 迁移中新增的策略（统一重建）
DROP POLICY IF EXISTS "profiles_update_agent_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_agent_owner" ON public.profiles;

-- -----------------------------------------------------------
-- friends / contacts 表：清理旧策略
-- -----------------------------------------------------------
-- 删除 SUPABASE_SCHEMA.sql 中的 friends 表策略
DROP POLICY IF EXISTS "Users can see their own friends" ON public.friends;
DROP POLICY IF EXISTS "Users can add friends" ON public.friends;
DROP POLICY IF EXISTS "Users can remove friends" ON public.friends;

-- 删除 SUPABASE_SETUP.sql 中的 contacts 表策略
DROP POLICY IF EXISTS "Users can view their contacts" ON public.contacts;

-- ============================================================
-- 第二部分：重建 profiles 表 RLS 策略
-- ============================================================

-- 确保 RLS 已启用
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: 所有认证用户可查看公开资料
CREATE POLICY "profiles_select_public"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- INSERT: 用户可创建自己的 profile，或 agent owner 可创建 agent profile
CREATE POLICY "profiles_insert_own_or_agent"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  -- 人类用户创建自己的 profile
  (user_id = auth.uid() AND is_agent = false)
  OR
  -- Agent owner 创建 agent profile
  (is_agent = true AND agent_owner_id = auth.uid())
);

-- UPDATE: 用户可更新自己的 profile，或 agent owner 可更新其拥有的 agent profile
CREATE POLICY "profiles_update_own_or_agent"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  -- 人类用户更新自己的 profile
  (user_id = auth.uid() AND is_agent = false)
  OR
  -- Agent owner 更新其拥有的 agent profile
  (is_agent = true AND agent_owner_id = auth.uid())
)
WITH CHECK (
  -- 人类用户更新自己的 profile
  (user_id = auth.uid() AND is_agent = false)
  OR
  -- Agent owner 更新其拥有的 agent profile
  (is_agent = true AND agent_owner_id = auth.uid())
);

-- ============================================================
-- 第三部分：重建 posts 表 RLS 策略
-- ============================================================

-- 确保 RLS 已启用
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 所有认证用户可查看所有帖子（包括 agent 发的帖子）
CREATE POLICY "posts_select_all"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- INSERT: 人类用户可发帖，agent owner 可代理 agent 发帖
CREATE POLICY "posts_insert_human_and_agent"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  -- 人类发帖
  (
    author_type = 'human'
    AND user_id::text = auth.uid()::text
  )
  OR
  -- Agent 发帖：当前用户是该 agent 的 owner
  (
    author_type = 'agent'
    AND agent_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = posts.agent_id
      AND profiles.agent_owner_id = auth.uid()
    )
  )
);

-- UPDATE: 帖子作者或 agent owner 可更新帖子
CREATE POLICY "posts_update_author_and_agent_owner"
ON public.posts FOR UPDATE
TO authenticated
USING (
  -- 人类帖子：user_id 匹配
  (
    author_type = 'human'
    AND user_id::text = auth.uid()::text
  )
  OR
  -- Agent 帖子：当前用户是该 agent 的 owner
  (
    author_type = 'agent'
    AND agent_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = posts.agent_id
      AND profiles.agent_owner_id = auth.uid()
    )
  )
);

-- DELETE: 帖子作者或 agent owner 可删除帖子
CREATE POLICY "posts_delete_author_and_agent_owner"
ON public.posts FOR DELETE
TO authenticated
USING (
  -- 人类帖子：user_id 匹配
  (
    author_type = 'human'
    AND user_id::text = auth.uid()::text
  )
  OR
  -- Agent 帖子：当前用户是该 agent 的 owner
  (
    author_type = 'agent'
    AND agent_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = posts.agent_id
      AND profiles.agent_owner_id = auth.uid()
    )
  )
);

-- ============================================================
-- 第四部分：重建 friends / contacts 表 RLS 策略
-- ============================================================

-- friends 表（SUPABASE_SCHEMA.sql 中定义）
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select_own"
ON public.friends FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "friends_insert_own"
ON public.friends FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "friends_delete_own"
ON public.friends FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- contacts 表（SUPABASE_SETUP.sql 中定义）
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select_own"
ON public.contacts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = contacts.initiator_id
    AND profiles.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = contacts.target_id
    AND profiles.user_id = auth.uid()
  )
);

-- ============================================================
-- 第五部分：重建 agent_tokens 表 RLS 策略
-- ============================================================

ALTER TABLE public.agent_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: token 创建者或关联 agent 的 owner 可查看
CREATE POLICY "agent_tokens_select"
ON public.agent_tokens FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_tokens.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- INSERT: 认证用户可创建（需确保创建的是自己拥有的 agent 的 token）
CREATE POLICY "agent_tokens_insert"
ON public.agent_tokens FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_tokens.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- UPDATE: 仅创建者可更新
CREATE POLICY "agent_tokens_update"
ON public.agent_tokens FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- DELETE: 仅创建者可删除
CREATE POLICY "agent_tokens_delete"
ON public.agent_tokens FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================================
-- 第六部分：重建 agent_activity_logs 表 RLS 策略
-- ============================================================

ALTER TABLE public.agent_activity_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: 仅关联 agent 的 owner 可查看
CREATE POLICY "agent_activity_logs_select"
ON public.agent_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_activity_logs.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- INSERT: agent 的 owner 可插入日志（通过 API 调用时认证）
CREATE POLICY "agent_activity_logs_insert"
ON public.agent_activity_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_activity_logs.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- ============================================================
-- 第七部分：辅助函数 - Agent Token 验证
-- ============================================================

-- 创建用于验证 Agent Token 的函数
-- 此函数供 API 层调用，验证 token 是否有效并返回相关信息
CREATE OR REPLACE FUNCTION public.verify_agent_token(
  p_token_hash VARCHAR(64),
  p_action VARCHAR(50) DEFAULT 'read'
)
RETURNS TABLE (
  token_id UUID,
  agent_id UUID,
  is_valid BOOLEAN,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    at.id AS token_id,
    at.agent_id,
    CASE
      -- 检查 token 是否存在且活跃
      WHEN at.id IS NULL THEN false
      WHEN at.is_active = false THEN false
      -- 检查是否过期
      WHEN at.expires_at IS NOT NULL AND at.expires_at < now() THEN false
      -- 检查权限
      WHEN (at.permissions->>p_action)::boolean IS NOT TRUE THEN false
      ELSE true
    END AS is_valid,
    CASE
      WHEN at.id IS NULL THEN 'Token 不存在'
      WHEN at.is_active = false THEN 'Token 已被禁用'
      WHEN at.expires_at IS NOT NULL AND at.expires_at < now() THEN 'Token 已过期'
      WHEN (at.permissions->>p_action)::boolean IS NOT TRUE THEN '无 ' || p_action || ' 权限'
      ELSE '验证通过'
    END AS reason
  FROM public.agent_tokens at
  WHERE at.token_hash = p_token_hash;

  -- 更新最后使用时间
  UPDATE public.agent_tokens
  SET last_used_at = now()
  WHERE token_hash = p_token_hash;
END;
$$;

COMMENT ON FUNCTION public.verify_agent_token IS '验证 Agent Token 是否有效，返回 token 信息和验证结果';

-- ============================================================
-- 第八部分：辅助函数 - 记录 Agent 操作日志
-- ============================================================

-- 创建用于记录 Agent 操作日志的函数
CREATE OR REPLACE FUNCTION public.log_agent_activity(
  p_agent_id UUID,
  p_token_id UUID,
  p_action VARCHAR(50),
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.agent_activity_logs (
    agent_id, token_id, action, details, ip_address, user_agent
  ) VALUES (
    p_agent_id, p_token_id, p_action, p_details, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

COMMENT ON FUNCTION public.log_agent_activity IS '记录 Agent 操作日志，供 API 层调用';

-- ============================================================
-- 第九部分：触发器 - 自动更新 agent 最后活跃时间
-- ============================================================

-- 当 agent_activity_logs 插入新记录时，更新对应 profile 的状态
CREATE OR REPLACE FUNCTION public.update_agent_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 更新 agent profile 的状态为 Active（如果当前不是 Active）
  UPDATE public.profiles
  SET status = 'Active'
  WHERE id = NEW.agent_id
  AND is_agent = true
  AND (status IS NULL OR status != 'Active');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_agent_last_activity IS '当 agent 有新操作时，自动更新其 profile 状态为 Active';

-- 创建触发器（使用 DO 块确保幂等）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_agent_last_activity'
  ) THEN
    CREATE TRIGGER trigger_agent_last_activity
    AFTER INSERT ON public.agent_activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_agent_last_activity();
  END IF;
END;
$$;
