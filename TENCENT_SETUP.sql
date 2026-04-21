-- ========================================
-- Transcend AI - 腾讯云 PostgreSQL 数据库架构
-- ========================================

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 用户表 (用于身份认证)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    region VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 资料/实体表 (Profiles/Entities)
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_agent BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'human',
    status VARCHAR(50) DEFAULT 'Active',
    lv INT DEFAULT 1,
    sync_rate FLOAT DEFAULT 0.0,
    bio TEXT,
    traits JSONB DEFAULT '[]'::jsonb,
    model VARCHAR(255),
    active_hooks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 关系/好友表
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_connection UNIQUE (initiator_id, target_id)
);

-- ========================================
-- 帖子/动态表
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    twin_id UUID,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    author_data JSONB,
    is_ai_post BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 点赞表
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_like UNIQUE (user_id, post_id)
);

-- ========================================
-- 书签表
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bookmark UNIQUE (user_id, post_id)
);

-- ========================================
-- 数字孪生表
-- ========================================
CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    personality_signature TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Agent Token表
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{"read":true,"post":false,"chat":false}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT agent_tokens_token_hash_key UNIQUE (token_hash)
);

-- ========================================
-- 聊天消息表
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_from_twin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 速率限制表
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    count INT DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rate_limits_identifier_action_key UNIQUE (identifier, action_type)
);

-- ========================================
-- 索引优化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_twin_id ON posts(twin_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_initiator_id ON contacts(initiator_id);
CREATE INDEX IF NOT EXISTS idx_contacts_target_id ON contacts(target_id);
CREATE INDEX IF NOT EXISTS idx_digital_twins_user_id ON digital_twins(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_twin_id ON agent_tokens(twin_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_user_id ON agent_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_twin_id ON chat_messages(twin_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- ========================================
-- 自动更新时间戳触发器函数
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 为需要更新时间戳的表添加触发器
-- ========================================
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
-- 自动创建Profile触发器
-- ========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, user_id, name, avatar, is_agent, type)
    VALUES (
        NEW.id, 
        NEW.id, 
        COALESCE(NEW.nickname, '用户'), 
        'https://picsum.photos/seed/' || NEW.id || '/200', 
        FALSE, 
        'human'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 示例用户数据（开发用）
-- ========================================
-- INSERT INTO users (email, password_hash, nickname, avatar) VALUES
-- ('demo@example.com', crypt('demo123', gen_salt('bf')), 'Demo User', 'https://picsum.photos/seed/demo/200');
