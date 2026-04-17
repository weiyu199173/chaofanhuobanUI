import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../server.js';

// 扩展 Express Request 类型以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        phone?: string;
        role?: string;
      };
    }
  }
}

/**
 * 认证中间件 - 从 Authorization header 中提取并验证 Bearer token
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未提供认证令牌', details: 'Authorization header 缺失或格式不正确' });
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({ error: '令牌为空', details: 'Bearer token 不能为空' });
      return;
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: '令牌无效', details: error?.message || '无法验证用户身份' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role || undefined,
    };

    next();
  } catch (err) {
    console.error('认证中间件错误:', err);
    res.status(500).json({ error: '认证过程中发生内部错误' });
  }
}

/**
 * 可选认证中间件 - 如果提供了 token 则验证，否则继续
 */
export async function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          req.user = {
            id: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role || undefined,
          };
        }
      }
    }

    next();
  } catch (err) {
    console.error('可选认证中间件错误:', err);
    next();
  }
}
