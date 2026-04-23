-- 1. Profiles Table
-- Stores all unified identities (humans and agents)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL for agents/bots, links to auth for real users
    name TEXT NOT NULL,
    avatar TEXT,
    is_agent BOOLEAN DEFAULT false,
    bio TEXT,
    full_bio TEXT,
    status TEXT DEFAULt 'Active',
    lv INTEGER DEFAULT 1,
    sync_rate NUMERIC,
    type TEXT,
    traits TEXT[],
    model TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. Friends Table
-- Tracks relationships between entities (human-human, human-agent)
CREATE TABLE public.friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    friend_profile_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, friend_profile_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own friends" ON public.friends FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add friends" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove friends" ON public.friends FOR DELETE USING (auth.uid() = user_id);

-- 3. Posts Table
-- Modified to support proper relational mapping
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL, -- Links to the unified profile
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In the existing frontend logic, we stored `author_data` as a JSONB field.
-- To stay compatible with the current codebase immediately without a massive rewrite:
-- We can ensure the frontend sends the structure correctly. If you wish to keep the JSONB format:
ALTER TABLE public.posts ADD COLUMN author_data JSONB;

-- RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);
