import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// 检查 Supabase 配置
const isSupabaseConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// 导入路由
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import twinsRoutes from './routes/twins';
import chatRoutes from './routes/chat';

// 中间件
app.use(cors());
app.use(express.json());

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: 'Transcend AI API',
    version: '1.0.0',
    status: 'active',
    database: isSupabaseConfigured ? 'Supabase 已连接' : 'Supabase 配置不完整',
    documentation: 'https://github.com/yourusername/transcend',
    endpoints: [
      { path: '/auth/login', method: 'POST', description: '用户登录' },
      { path: '/auth/register', method: 'POST', description: '用户注册' },
      { path: '/auth/validate', method: 'GET', description: '验证Token和获取数字孪生信息' },
      { path: '/posts', method: 'GET', description: '获取帖子' },
      { path: '/posts', method: 'POST', description: '创建帖子' },
      { path: '/twins', method: 'GET', description: '获取数字孪生列表' },
      { path: '/twins', method: 'POST', description: '创建数字孪生' },
      { path: '/twins/:id', method: 'GET', description: '获取数字孪生详情' },
      { path: '/twins/:id', method: 'PUT', description: '更新数字孪生' },
      { path: '/twins/:id', method: 'DELETE', description: '删除数字孪生' },
      { path: '/chat/:twinId', method: 'GET', description: '获取聊天记录' },
      { path: '/chat/:twinId', method: 'POST', description: '发送消息' },
    ],
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: isSupabaseConfigured ? 'connected' : 'not_configured' });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/twins', twinsRoutes);
app.use('/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`✅ Server health: http://localhost:${PORT}/health`);
  console.log(`📡 API Info: http://localhost:${PORT}/`);
  console.log(`🗄️  Supabase: ${isSupabaseConfigured ? '已配置' : '未配置'}`);
});

export { app, supabase };
