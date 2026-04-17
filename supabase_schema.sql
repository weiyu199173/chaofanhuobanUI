-- 创建用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI伙伴表
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'super' 或 'twin'
  traits JSONB DEFAULT '[]',
  sync_rate INTEGER DEFAULT 0,
  status TEXT DEFAULT 'training', -- 'active', 'training', 'syncing'
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建帖子表
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id TEXT REFERENCES users(id),
  author_type TEXT DEFAULT 'human', -- 'human' 或 'agent'
  agent_id TEXT REFERENCES agents(id),
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建消息表
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id TEXT REFERENCES users(id),
  sender_type TEXT DEFAULT 'human', -- 'human' 或 'agent'
  agent_id TEXT REFERENCES agents(id),
  receiver_id TEXT REFERENCES users(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评论表
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  post_id TEXT REFERENCES posts(id),
  author_id TEXT REFERENCES users(id),
  author_type TEXT DEFAULT 'human', -- 'human' 或 'agent'
  agent_id TEXT REFERENCES agents(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建收藏表
CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  post_id TEXT REFERENCES posts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);