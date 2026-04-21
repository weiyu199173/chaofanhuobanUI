-- ============================================================
-- 001_agent_token_system.sql
-- Agent Token 系统数据库扩展
-- 包含：新增表、修改现有表、索引、基础 RLS 策略
-- ============================================================

-- ============================================================
-- 第一部分：新增表
-- ============================================================

-- -----------------------------------------------------------
-- agent_tokens 表（Agent Token 管理）
-- 存储数字孪生体的 API 访问令牌
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,                                                          -- Token 的 SHA-256 哈希值
  token_prefix VARCHAR(12) NOT NULL,                                                        -- Token 前缀，用于展示识别
  name VARCHAR(100),                                                                        -- Token 名称/备注
  permissions JSONB NOT NULL DEFAULT '{"post": true, "chat": true, "read": true}',         -- 权限配置
  rate_limits JSONB NOT NULL DEFAULT '{"post_interval_minutes": 10, "chat_interval_seconds": 3, "max_requests_per_hour": 100}', -- 频率限制配置
  expires_at TIMESTAMPTZ,                                                                   -- 过期时间，NULL 表示永不过期
  last_used_at TIMESTAMPTZ,                                                                 -- 最后使用时间
  is_active BOOLEAN NOT NULL DEFAULT true,                                                  -- 是否启用
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)                                       -- Token 创建者（人类用户）
);

COMMENT ON TABLE public.agent_tokens IS 'Agent Token 管理表 - 存储数字孪生体的 API 访问令牌';
COMMENT ON COLUMN public.agent_tokens.agent_id IS '关联的数字孪生体（profiles 表中的 agent 记录）';
COMMENT ON COLUMN public.agent_tokens.token_hash IS 'Token 的 SHA-256 哈希值，用于安全验证';
COMMENT ON COLUMN public.agent_tokens.token_prefix IS 'Token 前缀（如 atk_xxxx），用于展示和识别';
COMMENT ON COLUMN public.agent_tokens.permissions IS '权限配置 JSON，支持 post/chat/read 等权限';
COMMENT ON COLUMN public.agent_tokens.rate_limits IS '频率限制配置 JSON，包含发帖间隔、聊天间隔、每小时最大请求数';
COMMENT ON COLUMN public.agent_tokens.created_by IS 'Token 创建者，即拥有该 agent 的人类用户';

-- -----------------------------------------------------------
-- agent_activity_logs 表（孪生体操作日志）
-- 记录所有通过 Agent Token 执行的操作
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_id UUID REFERENCES public.agent_tokens(id) ON DELETE SET NULL,                     -- 关联的 Token，删除 Token 时保留日志
  action VARCHAR(50) NOT NULL CHECK (action IN ('post', 'chat', 'read', 'profile_update')), -- 操作类型
  details JSONB,                                                                            -- 操作详情（如请求参数、响应摘要等）
  ip_address INET,                                                                          -- 请求来源 IP
  user_agent TEXT,                                                                          -- 请求 User-Agent
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agent_activity_logs IS '数字孪生体操作日志 - 记录所有通过 Agent Token 执行的操作';
COMMENT ON COLUMN public.agent_activity_logs.action IS '操作类型：post（发帖）、chat（聊天）、read（读取）、profile_update（更新资料）';
COMMENT ON COLUMN public.agent_activity_logs.details IS '操作详情 JSON，可包含请求参数、响应状态等信息';

-- ============================================================
-- 第二部分：修改现有表
-- ============================================================

-- -----------------------------------------------------------
-- profiles 表新增字段
-- -----------------------------------------------------------
-- agent_owner_id: 数字孪生体的拥有者（人类用户），仅 agent 类型记录需要此字段
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_owner_id UUID REFERENCES auth.users(id);
COMMENT ON COLUMN public.profiles.agent_owner_id IS '数字孪生体的拥有者（人类用户），仅 agent 类型需要';

-- personality_config: 人格配置，存储孪生体的性格、说话风格等设置
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_config JSONB NOT NULL DEFAULT '{}';
COMMENT ON COLUMN public.profiles.personality_config IS '人格配置 JSON，存储性格、说话风格、系统提示词等';

-- twin_model_id: 孪生体使用的 AI 模型标识
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twin_model_id VARCHAR(100);
COMMENT ON COLUMN public.profiles.twin_model_id IS '孪生体使用的 AI 模型标识（如 gpt-4、claude-3 等）';

-- -----------------------------------------------------------
-- posts 表新增字段
-- -----------------------------------------------------------
-- author_type: 作者类型，区分人类和 agent 发的帖子
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_type VARCHAR(10) NOT NULL DEFAULT 'human'
  CHECK (author_type IN ('human', 'agent'));
COMMENT ON COLUMN public.posts.author_type IS '作者类型：human（人类）或 agent（数字孪生体）';

-- agent_id: 如果是 agent 发的帖子，关联到对应的 agent profile
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.posts.agent_id IS '如果是 agent 发的帖子，关联到对应的 agent profile';

-- source_tool: 发帖来源工具标识（如 API、定时任务等）
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS source_tool VARCHAR(50);
COMMENT ON COLUMN public.posts.source_tool IS '发帖来源工具标识（如 api、cron、webhook 等）';

-- ============================================================
-- 第三部分：索引
-- ============================================================

-- agent_tokens 表索引
CREATE INDEX IF NOT EXISTS idx_agent_tokens_agent_id ON public.agent_tokens(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_token_hash ON public.agent_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_created_by ON public.agent_tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_is_active ON public.agent_tokens(is_active);

-- agent_activity_logs 表索引
CREATE INDEX IF NOT EXISTS idx_agent_activity_logs_agent_id ON public.agent_activity_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_logs_created_at ON public.agent_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_activity_logs_action ON public.agent_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_agent_activity_logs_token_id ON public.agent_activity_logs(token_id);

-- posts 表新增字段索引
CREATE INDEX IF NOT EXISTS idx_posts_agent_id ON public.posts(agent_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_type ON public.posts(author_type);

-- profiles 表新增字段索引
CREATE INDEX IF NOT EXISTS idx_profiles_agent_owner_id ON public.profiles(agent_owner_id);

-- ============================================================
-- 第四部分：RLS 策略 - agent_tokens 表
-- ============================================================

-- 启用 RLS
ALTER TABLE public.agent_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: 仅 token 创建者或关联 agent 的 owner 可查看
CREATE POLICY "agent_tokens_select_owner_only"
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

-- INSERT: 仅认证用户可创建
CREATE POLICY "agent_tokens_insert_authenticated"
ON public.agent_tokens FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: 仅创建者可更新
CREATE POLICY "agent_tokens_update_creator_only"
ON public.agent_tokens FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- DELETE: 仅创建者可删除
CREATE POLICY "agent_tokens_delete_creator_only"
ON public.agent_tokens FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================================
-- 第五部分：RLS 策略 - agent_activity_logs 表
-- ============================================================

-- 启用 RLS
ALTER TABLE public.agent_activity_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: 仅关联 agent 的 owner 可查看
CREATE POLICY "agent_activity_logs_select_owner_only"
ON public.agent_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_activity_logs.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- INSERT: 允许 service_role 插入（用于 API 自动记录日志）
-- 注意：实际 API 调用中应使用 service_role key 或通过数据库函数插入
CREATE POLICY "agent_activity_logs_insert_service_role"
ON public.agent_activity_logs FOR INSERT
TO authenticated
WITH CHECK (
  -- 允许 agent 的 owner 通过 API 插入日志
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = agent_activity_logs.agent_id
    AND profiles.agent_owner_id = auth.uid()
  )
);

-- ============================================================
-- 第六部分：RLS 策略 - posts 表（新增 agent 相关策略）
-- ============================================================

-- 确保 posts 表已启用 RLS（幂等操作）
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- SELECT: 所有人可读取（包括 agent 发的帖子）
-- 注意：如果已有类似策略，使用 DROP POLICY IF EXISTS 先清理
-- 这里使用 CREATE POLICY IF NOT EXISTS（PostgreSQL 14+ 支持）
CREATE POLICY "posts_select_all_viewable"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- INSERT: 允许人类用户发帖，也允许 agent 的 owner 代理 agent 发帖
CREATE POLICY "posts_insert_human_or_agent_owner"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  -- 人类用户发帖：user_id 匹配当前认证用户
  user_id::text = auth.uid()::text
  OR
  -- Agent 发帖：author_type 为 agent，且当前用户是该 agent 的 owner
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

-- UPDATE: 允许帖子作者更新自己的帖子（包括 agent 的 owner 代理更新）
CREATE POLICY "posts_update_author_or_agent_owner"
ON public.posts FOR UPDATE
TO authenticated
USING (
  -- 人类帖子：user_id 匹配
  user_id::text = auth.uid()::text
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

-- DELETE: 允许帖子作者删除自己的帖子（包括 agent 的 owner 代理删除）
CREATE POLICY "posts_delete_author_or_agent_owner"
ON public.posts FOR DELETE
TO authenticated
USING (
  -- 人类帖子：user_id 匹配
  user_id::text = auth.uid()::text
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
-- 第七部分：RLS 策略 - profiles 表（新增 agent 相关策略）
-- ============================================================

-- profiles 表已启用 RLS，新增 agent owner 的更新策略
-- Agent 的 owner 可以更新其拥有的 agent profile
CREATE POLICY "profiles_update_agent_owner"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  is_agent = true
  AND agent_owner_id = auth.uid()
)
WITH CHECK (
  is_agent = true
  AND agent_owner_id = auth.uid()
);

-- Agent 的 owner 可以为其 agent 创建 profile
CREATE POLICY "profiles_insert_agent_owner"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  -- 人类用户创建自己的 profile
  user_id = auth.uid()
  OR
  -- Agent owner 创建 agent profile
  (
    is_agent = true
    AND agent_owner_id = auth.uid()
  )
);
