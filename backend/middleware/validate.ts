import { Request, Response, NextFunction } from 'express';

/**
 * 清理字符串输入 - 去除首尾空白并防止 XSS
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * 验证 UUID 格式
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 验证必填字段
 */
export function validateRequiredFields(body: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `缺少必填字段: ${field}`;
    }
  }
  return null;
}

/**
 * 验证分页参数
 */
export function parsePagination(query: Record<string, unknown>): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * 验证中间件工厂 - 验证请求体中的必填字段
 */
export function requireFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const error = validateRequiredFields(req.body as Record<string, unknown>, fields);
    if (error) {
      res.status(400).json({ error, details: `以下字段为必填: ${fields.join(', ')}` });
      return;
    }
    next();
  };
}

/**
 * 验证 UUID 参数中间件
 */
export function validateUUIDParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!value || !isValidUUID(value)) {
      res.status(400).json({ error: `无效的 ${paramName}`, details: `${paramName} 必须是有效的 UUID 格式` });
      return;
    }
    next();
  };
}
