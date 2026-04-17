import { supabaseAdmin } from './supabase';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
}

/**
 * 从 Bearer token 中获取用户信息
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return {
    id: user.id,
    email: user.email || undefined,
    phone: user.phone || undefined,
    role: user.role || undefined,
  };
}

/**
 * 从请求头中提取 Bearer token
 */
export function getTokenFromHeaders(headers: Record<string, string | string[] | undefined>): string | null {
  const auth = headers.authorization || headers.Authorization;
  if (!auth) return null;
  const value = Array.isArray(auth) ? auth[0] : auth;
  if (!value || !value.startsWith('Bearer ')) return null;
  return value.substring(7);
}

/**
 * 认证中间件 - 从请求中提取并验证用户
 * 返回用户对象或 null（未认证）
 */
export async function authenticateRequest(
  headers: Record<string, string | string[] | undefined>
): Promise<{ user: AuthUser | null; errorResponse?: { status: number; body: string } }> {
  const token = getTokenFromHeaders(headers);
  if (!token) {
    return {
      user: null,
      errorResponse: {
        status: 401,
        body: JSON.stringify({ error: '未提供认证令牌', details: 'Authorization header 缺失或格式不正确' }),
      },
    };
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return {
      user: null,
      errorResponse: {
        status: 401,
        body: JSON.stringify({ error: '令牌无效', details: '无法验证用户身份' }),
      },
    };
  }

  return { user };
}

/**
 * 可选认证 - 如果提供了 token 则验证，否则返回 null
 */
export async function optionalAuthenticateRequest(
  headers: Record<string, string | string[] | undefined>
): Promise<AuthUser | null> {
  const token = getTokenFromHeaders(headers);
  if (!token) return null;
  return await getUserFromToken(token);
}
