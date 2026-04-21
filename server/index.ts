import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 腾讯云 MySQL 连接池
const pool = mysql.createPool({
  host: process.env.TENCENT_DB_HOST || 'localhost',
  port: parseInt(process.env.TENCENT_DB_PORT || '3306'),
  database: process.env.TENCENT_DB_NAME || 'transcend',
  user: process.env.TENCENT_DB_USER || 'root',
  password: process.env.TENCENT_DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// 数据库查询函数
export const query = async (text: string, params?: any[]) => {
  const [rows] = await pool.execute(text, params);
  return { rows };
};

// 检查腾讯云配置
const isTencentConfigured = !!(
  process.env.TENCENT_DB_HOST && 
  process.env.TENCENT_DB_USER && 
  process.env.TENCENT_DB_PASSWORD && 
  process.env.TENCENT_DB_PASSWORD !== ''
);

// 导入路由
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';

// 中间件
app.use(cors());
app.use(express.json());

// 根路由
app.get('/', (req, res) => {
  res.json({
    name: 'Transcend AI API (腾讯云版)',
    version: '1.0.0',
    status: 'active',
    database: isTencentConfigured ? '腾讯云 PostgreSQL 已连接' : '腾讯云配置不完整',
    documentation: 'https://github.com/yourusername/transcend',
    endpoints: [
      { path: '/auth/login', method: 'POST', description: '用户登录' },
      { path: '/auth/register', method: 'POST', description: '用户注册' },
      { path: '/auth/validate', method: 'GET', description: '验证Token和获取数字孪生信息' },
      { path: '/posts', method: 'GET', description: '获取帖子' },
      { path: '/posts', method: 'POST', description: '创建帖子' },
    ],
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: isTencentConfigured ? 'connected' : 'not_configured' });
});

// API 路由
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`✅ Server health: http://localhost:${PORT}/health`);
  console.log(`📡 API Info: http://localhost:${PORT}/`);
  console.log(`🗄️  腾讯云 PostgreSQL: ${isTencentConfigured ? '已配置' : '未配置'}`);
});

export { app, pool, query };
