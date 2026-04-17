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
 * 解析分页参数
 */
export function parsePagination(query: Record<string, string | undefined>): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(query.page || '') || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '') || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * 设置 CORS 响应头
 */
export function setCorsHeaders(res: { setHeader: (key: string, value: string) => void }): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
