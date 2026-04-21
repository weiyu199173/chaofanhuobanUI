-- ========================================
-- Transcend AI Database Schema
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Digital Twins Table
-- ========================================
CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    personality_traits TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT digital_twins_user_id_name_unique UNIQUE (user_id, name)
);

-- ========================================
-- Agent Tokens Table
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_id UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '["read"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT agent_tokens_token_hash_unique UNIQUE (token_hash)
);

-- ========================================
-- Posts Table Updates (extend existing)
-- ========================================
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_ai_post BOOLEAN DEFAULT false;

-- ========================================
-- Rate Limits Table
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT rate_limits_identifier_action_unique UNIQUE (identifier, action_type)
);

-- ========================================
-- Chat Messages Table (for AI chat functionality)
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_from_twin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Indexes for performance
-- ========================================
CREATE INDEX IF NOT EXISTS idx_digital_twins_user_id ON digital_twins(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_twin_id ON agent_tokens(twin_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_user_id ON agent_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tokens_token_hash ON agent_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_posts_twin_id ON posts(twin_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_twin_id ON chat_messages(twin_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON rate_limits(identifier, action_type);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Digital Twins RLS
ALTER TABLE digital_twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digital twins"
    ON digital_twins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own digital twins"
    ON digital_twins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own digital twins"
    ON digital_twins FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own digital twins"
    ON digital_twins FOR DELETE
    USING (auth.uid() = user_id);

-- Agent Tokens RLS
ALTER TABLE agent_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent tokens"
    ON agent_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent tokens"
    ON agent_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent tokens"
    ON agent_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent tokens"
    ON agent_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Chat Messages RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages involving them"
    ON chat_messages FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM digital_twins 
        WHERE digital_twins.id = chat_messages.twin_id 
        AND digital_twins.user_id = auth.uid()
    ));

CREATE POLICY "Users can send chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Updated At Triggers
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_digital_twins_updated_at
    BEFORE UPDATE ON digital_twins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

