import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import routes from './api/routes.js';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app = express();
const PORT = process.env.PORT || 3001;

// ==================== 中间件 ====================

// 安全头部
app.use(helmet());

// CORS 配置 - 允许 localhost:3000 和所有 Vercel 域名
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    // 匹配所有 Vercel 部署域名
    /https:\/\/.*\.vercel\.app$/,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    console.log(`${method} ${originalUrl} - ${statusCode} [${duration}ms]`);
  });

  next();
});

// ==================== Supabase 客户端 ====================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error('缺少 Supabase 环境变量。请检查 .env 文件中的 SUPABASE_URL, SUPABASE_ANON_KEY 和 SUPABASE_SERVICE_ROLE_KEY');
}

// Admin 客户端 - 使用 SERVICE_ROLE_KEY，绕过 RLS，用于管理操作
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon 客户端 - 使用 ANON_KEY，用于用户上下文操作
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// ==================== 路由 ====================

// 健康检查
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由（认证已移至前端通过 Supabase JS 直接处理）
app.use('/api', routes);

// ==================== 全局错误处理 ====================

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('未捕获的错误:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 ? '内部服务器错误' : err.message;

  res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ error: '路由不存在' });
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`API 根路径: http://localhost:${PORT}/api`);
});
