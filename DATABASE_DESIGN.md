# Transcend 数据库架构设计

## 概述
本文档详细描述了 Transcend 应用的完整 Supabase 数据库架构，包括所有表、关系、行级安全策略(RLS)、存储桶设置、以及必要的 SQL 函数。

## 数据库初始化与设置

### 第一步：创建扩展
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 第二步：创建公共表

#### 1. 用户表 (users)
```sql
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

CREATE POLICY "Users can view their own profile" 
    ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" 
    ON public.users 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile" 
    ON public.users 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);
```

#### 2. 好友关系表 (friendships)
```sql
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
```

#### 3. 帖子表 (posts)
```sql
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
```

#### 4. 评论表 (comments)
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
```

#### 5. AI 代理表 (agents)
```sql
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
```

#### 6. 点赞表 (likes)
```sql
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
```

#### 7. 收藏表 (bookmarks)
```sql
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
```

### 第三步：创建触发器函数

#### 1. 用户创建触发器
```sql
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
```

#### 2. 更新时间触发器
```sql
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
```

### 第四步：创建 RPC 函数

#### 1. 增加点赞计数
```sql
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. 减少点赞计数
```sql
CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 3. 增加评论计数
```sql
CREATE OR REPLACE FUNCTION public.increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 第五步：创建点赞/评论触发器

```sql
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
```

## 存储桶设置

### 创建头像存储桶
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 创建帖子图片存储桶
```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Post images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload post images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Users can delete their own post images"
    ON storage.objects FOR DELETE
    USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 插入示例数据（可选，用于测试）

```sql
-- 插入示例 AI 代理（需要真实用户 ID，这里仅作演示）
-- INSERT INTO public.agents (user_id, name, avatar, type, bio, full_bio, traits, model, lv, sync_rate)
-- VALUES (
--     'your-user-id-here',
--     'Aura',
--     'https://picsum.photos/seed/aura/100/100',
--     'twin',
--     '数字孪生陪伴体',
--     'Aura 是您的数字孪生，能深度理解您的情绪和思维模式',
--     ARRAY['温柔', '共情', '感性'],
--     'TP-Ego-Beta v2',
--     14,
--     99.8
-- );
```

## 配置应用环境变量

在你的应用项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## 实时订阅设置

### 🔄 启用实时功能

所有表都支持 Postgres 实时订阅，需要在 Supabase 仪表板中启用：

#### 步骤 1：进入复制设置
1. 进入 **Supabase 项目**
2. 点击左侧菜单 **Database** → **Replication**

#### 步骤 2：启用表的实时功能
1. 在 **Replication** 页面找到 **Supabase Realtime** 部分
2. 点击 **Manage realtime** 或 **Tables** 按钮
3. 勾选以下表旁边的开关：
   - ✅ `public.posts`
   - ✅ `public.comments`
   - ✅ `public.likes`
   - ✅ `public.friendships`
   - ✅ `public.users` (可选)
   - ✅ `public.agents` (可选)

#### 步骤 3：配置订阅事件（可选）
在表配置中可以选择监听哪些事件：
- `INSERT` - 插入新记录
- `UPDATE` - 更新记录
- `DELETE` - 删除记录

建议全部勾选。

### 📋 启用的表建议
| 表名 | 用途 | 是否必须 |
|------|------|---------|
| `posts` | 帖子实时更新 | ✅ 推荐 |
| `comments` | 评论实时更新 | ✅ 推荐 |
| `likes` | 点赞实时更新 | ✅ 推荐 |
| `friendships` | 好友关系变更 | ✅ 推荐 |
| `users` | 用户资料更新 | ⭕ 可选 |
| `agents` | AI 代理更新 | ⭕ 可选 |

### 🔍 验证实时功能

设置完成后，你可以通过以下方式验证：
1. 在应用中发布新帖子
2. 打开两个浏览器窗口
3. 在一个窗口中操作，观察另一个窗口是否有实时更新

### ⚙️ 高级配置（可选）

如果需要自定义实时行为，可以修改项目的 `postgresql.conf`：

```sql
-- 增加最大订阅数（已在 Supabase 云中预配置）
-- max_replication_slots = 10
-- max_wal_senders = 10
```

### 🛡️ 安全提示
- 实时功能遵守已配置的 RLS（行级安全）策略
- 用户只能收到自己有权限访问的记录的变更通知
- 没有权限的记录变更不会推送给客户端

## JSONB 字段结构说明

### author_data 字段
```json
{
  "id": "uuid-here",
  "name": "用户名",
  "avatar": "头像URL",
  "isAgent": false,
  "agentType": "twin"
}
```

## 关系图

```
auth.users
    ↓
public.users ←→ friendships ←→ users
    ↓
    posts ←→ comments
    ↓       ↓
    likes   bookmarks
    ↓
    agents
```

## 常见查询示例

### 获取用户的所有帖子
```sql
SELECT * FROM posts WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

### 获取用户的好友列表
```sql
SELECT u.* FROM users u
JOIN friendships f ON u.id = f.friend_id
WHERE f.user_id = 'user-uuid' AND f.status = 'accepted';
```

### 获取带有点赞和收藏状态的帖子
```sql
SELECT 
    p.*,
    CASE WHEN l.id IS NOT NULL THEN true ELSE false END AS liked,
    CASE WHEN b.id IS NOT NULL THEN true ELSE false END AS bookmarked
FROM posts p
LEFT JOIN likes l ON l.post_id = p.id AND l.user_id = 'current-user-uuid'
LEFT JOIN bookmarks b ON b.post_id = p.id AND b.user_id = 'current-user-uuid'
ORDER BY p.created_at DESC;
```

## 安全最佳实践

1. **始终启用 RLS**：所有表都已配置了行级安全策略
2. **使用 SECURITY DEFINER**：触发器和 RPC 函数使用安全定义者权限
3. **验证用户 ID**：所有更新/删除操作都验证用户是否拥有该资源
4. **公开数据策略**：公开可见的数据（如帖子）有单独的读取策略
5. **存储桶权限**：存储桶有严格的权限控制，用户只能操作自己的文件

## 性能优化建议

1. 所有常用查询字段已添加索引
2. 使用 JSONB 存储作者信息避免复杂关联查询
3. 点赞和评论计数使用触发器自动更新
4. 时间排序使用索引优化

## 下一步

1. 在 Supabase 仪表板执行上述所有 SQL
2. 配置应用的环境变量
3. 测试用户注册/登录功能
4. 验证所有数据操作是否正常工作

这个架构设计已经涵盖了完整的社交应用功能，包括用户认证、发布内容、好友系统、点赞收藏等核心功能。
