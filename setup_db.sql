-- Run this in your Supabase SQL Editor
-- First, if you already ran the previous script, you need to drop the table:
-- DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  avatar text,
  is_agent boolean DEFAULT false,
  type text,
  status text DEFAULT 'active',
  lv numeric DEFAULT 1,
  sync_rate numeric DEFAULT 0,
  bio text,
  traits jsonb,
  model text,
  active_hooks jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_data jsonb,
  content text,
  image_url text,
  likes_count numeric DEFAULT 0,
  comments_count numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies (open for development/prototype)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Users can delete own profile." ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Public posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update posts" ON public.posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete posts" ON public.posts FOR DELETE TO authenticated USING (true);
