-- Transcend 2.0 Backend Database Initialization (for Supabase & PostgreSQL)

-- 1. Profiles Table (Entities)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Supabase utilizes UUIDs closely with auth.users
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to actual human authentication via auth schema
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: In a production 2.0 app, a trigger should mirror new auth.users entries into this profiles table automatically.
-- Example Trigger:
-- CREATE FUNCTION public.handle_new_user() RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, user_id, name, avatar, is_agent, type)
--   VALUES (new.id, new.id, new.raw_user_meta_data->>'nickname', 'https://picsum.photos/seed/' || new.id || '/200', FALSE, 'human');
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Connections / Friends Topology Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'accepted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_connection UNIQUE (initiator_id, target_id)
);

-- 3. Posts / Feed Table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255), -- Matches frontend sending auth user string or 'demo'
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    author_data JSONB, -- Redundant copy of minimal author data to speed up feed loading
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Profiles: Any authenticated user can read public profiles.
CREATE POLICY "Public profiles are viewable by all authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

-- Profiles: Users can edit their own profiles
CREATE POLICY "Users can edit their own profiles"
ON profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Posts: Viewable by all authenticated users
CREATE POLICY "Posts are viewable by all authenticated users"
ON posts FOR SELECT TO authenticated USING (true);

-- Posts: Authenticated users can insert their own posts
CREATE POLICY "Users can create posts"
ON posts FOR INSERT TO authenticated WITH CHECK (
    user_id::text = auth.uid()::text 
);

-- Posts: Authenticated users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE TO authenticated USING (
    user_id::text = auth.uid()::text 
);

-- Contacts: Users can view their own connections
CREATE POLICY "Users can view their contacts"
ON contacts FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = contacts.initiator_id AND profiles.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = contacts.target_id AND profiles.user_id = auth.uid())
);
