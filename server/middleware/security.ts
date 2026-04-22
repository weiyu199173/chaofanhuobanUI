import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { supabase } from '../index';

const TOKEN_PREFIX = 'tkn_';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export function validateTokenFormat(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'missing_token',
        message: 'Missing or invalid Authorization header. Format: Bearer <token>',
      },
    });
  }

  const token = authHeader.substring('Bearer '.length);
  req.token = token;
  next();
}

export async function validateAndExtractToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.token;
    
    // 检查是否是 Agent Token
    if (token.startsWith(TOKEN_PREFIX)) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const { data, error } = await supabase
        .from('agent_tokens')
        .select(`
          *,
          digital_twins (*)
        `)
        .eq('token_hash', tokenHash)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return res.status(401).json({
          success: false,
          error: { code: 'invalid_token', message: 'Token is invalid, expired, or deactivated.' },
        });
      }

      // 检查过期
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          error: { code: 'token_expired', message: 'Token has expired.' },
        });
      }

      // 处理权限
      const permissions = data.permissions || { read: true, post: false, chat: false };
      
      req.tokenData = {
        ...data,
        permission_read: permissions.read,
        permission_post: permissions.post,
        permission_chat: permissions.chat,
      };
      req.twin = data.digital_twins;

      // 更新最后使用时间
      await supabase
        .from('agent_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', data.id);
      
    } else {
      // 普通 JWT 用户认证
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        req.userId = decoded.userId;
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          error: { code: 'invalid_token', message: 'Invalid or expired token.' },
        });
      }
    }

    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error during token validation.',
      },
    });
  }
}

export function checkPermission(permission: 'read' | 'post' | 'chat') {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenData = req.tokenData;
    
    if (!tokenData) {
      return res.status(403).json({
        success: false,
        error: { code: 'permission_denied', message: 'Token authentication required.' },
      });
    }
    
    const permissionField = `permission_${permission}`;
    if (!tokenData[permissionField]) {
      return res.status(403).json({
        success: false,
        error: { code: 'permission_denied', message: `Token missing required permission: ${permission}` },
      });
    }

    next();
  };
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-API-Version', '1.0.0');
  next();
}
