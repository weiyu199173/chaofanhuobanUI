import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../../lib/supabase';
import { authenticateRequest } from '../../../lib/auth';
import { setCorsHeaders, isValidUUID, parsePagination } from '../../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId1, userId2 } = req.query;

  if (!userId1 || typeof userId1 !== 'string' || !isValidUUID(userId1) ||
      !userId2 || typeof userId2 !== 'string' || !isValidUUID(userId2)) {
    return res.status(400).json({ error: '无效的用户 ID', details: '用户 ID 必须是有效的 UUID 格式' });
  }

  try {
    // GET /api/messages/conversation/:userId1/:userId2 - 获取两个用户之间的对话
    if (req.method === 'GET') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 只允许查看自己参与的对话
      if (user.id !== userId1 && user.id !== userId2) {
        return res.status(403).json({ error: '无权操作', details: '只能查看自己参与的对话' });
      }

      const query = req.query as Record<string, string | undefined>;
      const { page, limit, offset } = parsePagination(query);

      const { data, error, count } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact' })
        .or(
          `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
        )
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ error: '获取对话失败', details: error.message });
      }

      return res.json({
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('对话 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
