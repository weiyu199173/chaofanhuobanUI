-- ========================================
-- Transcend AI - Supabase/PostgreSQL 数据库架构
-- ========================================

-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    avatar TEXT,
    phone TEXT,
    region TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 资料/实体表
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    avatar TEXT,
    is_agent BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'human',
    status TEXT DEFAULT 'Active',
    lv INTEGER DEFAULT 1,
    sync_rate FLOAT DEFAULT 0.0,
    bio TEXT,
    traits JSONB,
    model TEXT,
    active_hooks JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);

-- ========================================
-- 关系/好友表
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID REFERENCES users(id),
    target_id UUID REFERENCES users(id),
    status TEXT DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(initiator_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_initiator_id ON contacts(initiator_id);
CREATE INDEX IF NOT EXISTS idx_contacts_target_id ON contacts(target_id);

-- ========================================
-- 帖子/动态表
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    twin_id UUID,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    author_data JSONB,
    is_ai_post BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_twin_id ON posts(twin_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- ========================================
-- 点赞表
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    post_id UUID REFERENCES posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);

-- ========================================
-- 书签表
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    post_id UUID REFERENCES posts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- ========================================
-- 数字孪生表
-- ========================================
CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    personality_signature TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_twins_user_id ON digital_twins(user_id);

-- ========================================
-- Agent Token表（用于外部AI工具接入）
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{"read": true, "post": false, "chat": false}',
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_agent_tokens_twin_id ON agent_tokens(twin_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_user_id ON agent_tokens(user_id);

-- ========================================
-- 聊天消息表
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_from_twin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_twin_id ON chat_messages(twin_id);

-- ========================================
-- 速率限制表
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id),
    action_type TEXT NOT NULL,
    action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_twin_id ON rate_limit_logs(twin_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_action_type ON rate_limit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_action_at ON rate_limit_logs(action_at);

-- ========================================
-- 触发器：创建用户时自动创建 profile
-- ========================================
CREATE OR REPLACE FUNCTION on_user_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, user_id, name, avatar, is_agent, type)
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.nickname, '用户'),
        CONCAT('https://picsum.photos/seed/', NEW.id, '/200'),
        false,
        'human'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION on_user_created();

-- ========================================
-- 触发器：更新 updated_at 字段
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要更新 updated_at 的表添加触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_twins_updated_at
BEFORE UPDATE ON digital_twins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 权限设置（可选）
-- ========================================
-- 授予 Supabase 服务角色所有权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 为新创建的表自动授予权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
