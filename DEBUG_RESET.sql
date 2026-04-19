-- ====================================================
-- 🔧 Transcend 数据库诊断与重置脚本 (完整版)
-- ====================================================
-- 使用方法：在 Supabase SQL Editor 中执行此脚本

-- ====================================================
-- 第一步：清理旧表（按依赖关系反向删除）
-- ====================================================
DROP TABLE IF EXISTS public.bookmarks CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.agents CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ====================================================
-- 第二步：创建扩展
-- ====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================
-- 第三步：创建公共表
-- ====================================================

-- 1. 用户表
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 简化的 RLS 策略（用于诊断）
CREATE POLICY "Enable all for authenticated users" 
  ON public.users 
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);

-- 2. 好友关系表
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" 
  ON public.friendships 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can send friend requests" 
  ON public.friendships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendship status" 
  ON public.friendships 
  FOR UPDATE 
  USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their friendships" 
  ON public.friendships 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- 3. 帖子表
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_data JSONB NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON public.posts(likes_count DESC);

-- 4. 评论表
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 5. AI 代理表
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('super', 'twin')),
  status VARCHAR(20) DEFAULT 'active',
  bio TEXT,
  full_bio TEXT,
  model VARCHAR(100),
  traits TEXT[],
  lv INTEGER DEFAULT 1,
  sync_rate NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agents" 
  ON public.agents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create agents" 
  ON public.agents 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own agents" 
  ON public.agents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents" 
  ON public.agents 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_type ON public.agents(type);

-- 6. 点赞表
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" 
  ON public.likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can like posts" 
  ON public.likes 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can unlike their own likes" 
  ON public.likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- 7. 收藏表
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can bookmark posts" 
  ON public.bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can unbookmark posts" 
  ON public.bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- ====================================================
-- 第四步：创建触发器函数
-- ====================================================

-- 1. 用户创建触发器
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nickname, avatar, bio, accountId)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '用户_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'bio', '探索数字生命的边界'),
    COALESCE(NEW.raw_user_meta_data->>'accountId', 'Transcend#' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. 更新时间触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 为所有表添加更新时间触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================
-- 第五步：创建 RPC 函数
-- ====================================================

-- 1. 增加点赞计数
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 减少点赞计数
CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 增加评论计数
CREATE OR REPLACE FUNCTION public.increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================
-- 第六步：创建点赞/评论触发器
-- ====================================================

CREATE OR REPLACE FUNCTION public.handle_like_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_likes_count(NEW.post_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.decrement_likes_count(OLD.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_change();

CREATE OR REPLACE FUNCTION public.handle_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.increment_comments_count(NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_change();

-- ====================================================
-- 验证数据库状态
-- ====================================================
SELECT '✅ 所有表已创建' AS status;

-- 显示已创建的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
