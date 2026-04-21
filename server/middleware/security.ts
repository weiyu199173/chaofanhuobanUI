import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { supabase } from '../index';

const TOKEN_PREFIX = 'tkn_';

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
  
  if (!token.startsWith(TOKEN_PREFIX)) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'invalid_token',
        message: 'Invalid token format. Token should start with "tkn_".',
      },
    });
  }

  req.token = token;
  next();
}

export async function validateAndExtractToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.token;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data, error } = await supabase
      .from('agent_tokens')
      .select(`
        *,
        twin:digital_twins(*)
      `)
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid_token',
          message: 'Token is invalid, expired, or deactivated.',
        },
      });
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'token_expired',
          message: 'Token has expired.',
        },
      });
    }

    // Attach to request
    req.tokenData = data;
    req.twin = data.twin;

    // Update last used
    await supabase
      .from('agent_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

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
    
    const permissionField = `permission_${permission}`;
    if (!tokenData[permissionField]) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'permission_denied',
          message: `Token missing required permission: ${permission}`,
        },
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
