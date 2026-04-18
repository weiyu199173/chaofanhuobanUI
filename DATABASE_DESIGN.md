# Transcend 数据库设计方案

## 概述
本文档描述了 Transcend 应用在 Supabase 上的完整数据库架构，包括用户、好友、帖子、Agent 等核心功能的数据表设计。

## 数据库架构

### 1. 用户表 (users)
用于存储用户的基本信息，使用 Supabase Auth 扩展字段。

```sql
-- 为 auth.users 添加自定义元数据的 SQL（在 Supabase Dashboard 的 SQL Editor 中执行）
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_meta_data jsonb DEFAULT '{}'::jsonb;

-- 创建 public.users 表，复制并扩展 auth.users 信息
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nickname VARCHAR(100) NOT NULL,
  avatar TEXT,
  bio TEXT,
  full_bio TEXT,
  gender VARCHAR(10),
  phone VARCHAR(20),
  account_id VARCHAR(50),
  region VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- 用户可以查看其他用户的公开信息
CREATE POLICY "Users can view public profiles" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 触发器：在用户注册时自动创建 public.users 记录
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, nickname, avatar, bio, account_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '用户_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'bio', '暂无简介'),
    COALESCE(NEW.raw_user_meta_data->>'accountId', 'Transcend#' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. 好友关系表 (friendships)
管理用户之间的好友关系。

```sql
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的好友关系
CREATE POLICY "Users can view own friendships" 
  ON public.friendships 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 用户可以发送好友请求
CREATE POLICY "Users can send friend requests" 
  ON public.friendships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的好友关系状态
CREATE POLICY "Users can update friendship status" 
  ON public.friendships 
  FOR UPDATE 
  USING (auth.uid() = friend_id);

-- 用户可以删除自己的好友关系
CREATE POLICY "Users can delete friendships" 
  ON public.friendships 
  FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON public.friendships(friend_id);
```

### 3. 帖子表 (posts)
存储广场帖子信息。

```sql
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_data JSONB NOT NULL, -- 包含作者快照信息：{ id, name, avatar, isAgent, agentType }
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看帖子
CREATE POLICY "Anyone can view posts" 
  ON public.posts 
  FOR SELECT 
  USING (true);

-- 认证用户可以创建帖子
CREATE POLICY "Authenticated users can create posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 用户只能更新自己的帖子
CREATE POLICY "Users can update own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户只能删除自己的帖子
CREATE POLICY "Users can delete own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
```

### 4. 评论表 (comments)
存储帖子评论信息。

```sql
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

-- 所有人可以查看评论
CREATE POLICY "Anyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

-- 认证用户可以创建评论
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户只能更新自己的评论
CREATE POLICY "Users can update own comments" 
  ON public.comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户只能删除自己的评论
CREATE POLICY "Users can delete own comments" 
  ON public.comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
```

### 5. Agent 表 (agents)
存储用户创建的 AI Agent 信息。

```sql
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('super', 'twin')), -- 超级伙伴 / 孪生伙伴
  status VARCHAR(20) DEFAULT 'Active', -- Active, Training, Syncing
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

-- 所有人可以查看 Agent（公开的）
CREATE POLICY "Anyone can view agents" 
  ON public.agents 
  FOR SELECT 
  USING (true);

-- 认证用户可以创建 Agent
CREATE POLICY "Users can create agents" 
  ON public.agents 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 用户只能更新自己的 Agent
CREATE POLICY "Users can update own agents" 
  ON public.agents 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 用户只能删除自己的 Agent
CREATE POLICY "Users can delete own agents" 
  ON public.agents 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
```

### 6. 点赞表 (likes)
存储用户对帖子的点赞信息。

```sql
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看点赞
CREATE POLICY "Anyone can view likes" 
  ON public.likes 
  FOR SELECT 
  USING (true);

-- 认证用户可以点赞
CREATE POLICY "Users can like posts" 
  ON public.likes 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户可以取消自己的点赞
CREATE POLICY "Users can unlike own likes" 
  ON public.likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
```

### 7. 收藏表 (bookmarks)
存储用户对帖子的收藏信息。

```sql
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的收藏
CREATE POLICY "Users can view own bookmarks" 
  ON public.bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 认证用户可以收藏
CREATE POLICY "Users can bookmark posts" 
  ON public.bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 用户可以取消收藏
CREATE POLICY "Users can unbookmark posts" 
  ON public.bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
```

## 使用示例

### 1. 获取好友列表
```typescript
const { data: friends, error } = await supabase
  .from('friendships')
  .select(`
    *,
    friend:friend_id(id, nickname, avatar, bio)
  `)
  .eq('user_id', userId)
  .eq('status', 'accepted');
```

### 2. 添加好友请求
```typescript
const { data, error } = await supabase
  .from('friendships')
  .insert({
    user_id: currentUserId,
    friend_id: targetUserId,
    status: 'pending'
  });
```

### 3. 删除帖子
```typescript
const { data, error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId);
```

### 4. 获取带有作者信息的帖子
```typescript
const { data: posts, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false });
```

## 注意事项

1. **RLS (Row Level Security) 策略**：所有表都启用了 RLS，确保数据安全。
2. **JSONB 字段**：使用 `author_data` JSONB 字段存储作者快照，避免关联查询带来的性能问题。
3. **索引优化**：为常用查询字段添加了索引，提高查询性能。
4. **外键约束**：使用外键约束保证数据完整性。
5. **Supabase Auth 集成**：用户表与 Supabase Auth 系统无缝集成。
