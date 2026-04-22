-- ========================================
-- Transcend AI - Supabase 完整数据库架构
-- ========================================

-- 先删除现有表（如果存在）
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS rate_limit_logs;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS agent_tokens;
DROP TABLE IF EXISTS digital_twins;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- ========================================
-- 关系/好友表
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(initiator_id, target_id)
);

-- ========================================
-- 帖子/动态表
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    author_data JSONB,
    is_ai_post BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 评论表
-- ========================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    author_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 点赞表
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ========================================
-- 书签表
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ========================================
-- 数字孪生表
-- ========================================
CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    personality_signature TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Agent Token表（用于外部AI工具接入）
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{"read": true, "post": false, "chat": false}',
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 聊天消息表
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_from_twin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 速率限制表
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 通知表
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- like, comment, follow, system
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 索引
-- ========================================
-- 用户相关索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);

-- 联系人索引
CREATE INDEX IF NOT EXISTS idx_contacts_initiator_id ON contacts(initiator_id);
CREATE INDEX IF NOT EXISTS idx_contacts_target_id ON contacts(target_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

-- 帖子索引
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_twin_id ON posts(twin_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 评论索引
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- 数字孪生索引
CREATE INDEX IF NOT EXISTS idx_digital_twins_user_id ON digital_twins(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_twins_is_active ON digital_twins(is_active);

-- 聊天消息索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_twin_id ON chat_messages(twin_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Agent Token索引
CREATE INDEX IF NOT EXISTS idx_agent_tokens_twin_id ON agent_tokens(twin_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_user_id ON agent_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_is_active ON agent_tokens(is_active);

-- 速率限制索引
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_twin_id ON rate_limit_logs(twin_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_action_type ON rate_limit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_action_at ON rate_limit_logs(action_at);

-- 通知索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- 数据库函数
-- ========================================
-- 增加点赞数
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET likes_count = likes_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 减少点赞数
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET likes_count = GREATEST(likes_count - 1, 0) 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增加评论数
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET comments_count = comments_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 减少评论数
CREATE OR REPLACE FUNCTION decrement_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET comments_count = GREATEST(comments_count - 1, 0) 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 触发器
-- ========================================
-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要更新时间戳的表添加触发器
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_twins_updated_at
BEFORE UPDATE ON digital_twins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建用户时自动创建 profile
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

CREATE TRIGGER on_user_created
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION on_user_created();

-- 评论时自动增加评论数
CREATE OR REPLACE FUNCTION on_comment_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM increment_comments_count(NEW.post_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_created
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION on_comment_created();

-- 删除评论时自动减少评论数
CREATE OR REPLACE FUNCTION on_comment_deleted()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM decrement_comments_count(OLD.post_id);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_comment_deleted
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION on_comment_deleted();

-- ========================================
-- RLS 策略
-- ========================================
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 用户表 RLS
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- 资料表 RLS
CREATE POLICY "Profiles can be viewed by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- 联系人表 RLS
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (initiator_id = auth.uid() OR target_id = auth.uid());

CREATE POLICY "Users can create contact requests" ON contacts
    FOR INSERT WITH CHECK (initiator_id = auth.uid());

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (initiator_id = auth.uid() OR target_id = auth.uid());

-- 帖子表 RLS
CREATE POLICY "Posts can be viewed by everyone" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts" ON posts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (user_id = auth.uid());

-- 评论表 RLS
CREATE POLICY "Comments can be viewed by everyone" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (user_id = auth.uid());

-- 点赞表 RLS
CREATE POLICY "Users can view own likes" ON likes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create likes" ON likes
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes" ON likes
    FOR DELETE USING (user_id = auth.uid());

-- 收藏表 RLS
CREATE POLICY "Users can view own bookmarks" ON bookmarks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own bookmarks" ON bookmarks
    FOR DELETE USING (user_id = auth.uid());

-- 数字孪生表 RLS
CREATE POLICY "Users can view own digital twins" ON digital_twins
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create digital twins" ON digital_twins
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own digital twins" ON digital_twins
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own digital twins" ON digital_twins
    FOR DELETE USING (user_id = auth.uid());

-- 聊天消息表 RLS
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can send messages to own twins" ON chat_messages
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Agent Token表 RLS
CREATE POLICY "Users can view own agent tokens" ON agent_tokens
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create agent tokens" ON agent_tokens
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own agent tokens" ON agent_tokens
    FOR UPDATE USING (user_id = auth.uid());

-- 通知表 RLS
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ========================================
-- 权限设置
-- ========================================
-- 授予 Supabase 服务角色所有权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 为新创建的表自动授予权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON FUNCTIONS TO service_role;
