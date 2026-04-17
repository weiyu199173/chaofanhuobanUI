import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';
import { authenticateRequest } from '../../lib/auth';
import { setCorsHeaders, isValidUUID } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId, postId } = req.query;

  if (!userId || typeof userId !== 'string' || !isValidUUID(userId) ||
      !postId || typeof postId !== 'string' || !isValidUUID(postId)) {
    return res.status(400).json({ error: '无效的 ID', details: 'userId 和 postId 必须是有效的 UUID 格式' });
  }

  try {
    // DELETE /api/bookmarks/:userId/:postId - 取消收藏（需要认证）
    if (req.method === 'DELETE') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 只能取消自己的收藏
      if (user.id !== userId) {
        return res.status(403).json({ error: '无权操作', details: '只能取消自己的收藏' });
      }

      const { error, count } = await supabaseAdmin
        .from('bookmarks')
        .delete({ count: 'exact' })
        .eq('user_id', userId)
        .eq('post_id', postId);

      if (error) {
        return res.status(400).json({ error: '取消收藏失败', details: error.message });
      }

      if (count === 0) {
        return res.status(404).json({ error: '收藏不存在', details: '未找到该收藏记录' });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('收藏删除 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
