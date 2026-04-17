import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, isValidUUID } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { postId } = req.query;

  if (!postId || typeof postId !== 'string' || !isValidUUID(postId)) {
    return res.status(400).json({ error: '无效的帖子 ID', details: 'postId 必须是有效的 UUID 格式' });
  }

  try {
    // DELETE /api/likes/:postId - 取消点赞（需要认证）
    if (req.method === 'DELETE') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { error, count } = await supabaseAdmin
        .from('likes')
        .delete({ count: 'exact' })
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) {
        return res.status(400).json({ error: '取消点赞失败', details: error.message });
      }

      if (count === 0) {
        return res.status(404).json({ error: '点赞不存在', details: '未找到该点赞记录' });
      }

      // 更新帖子的 likes 计数
      const { count: newCount } = await supabaseAdmin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabaseAdmin
        .from('posts')
        .update({ likes: newCount || 0 })
        .eq('id', postId);

      return res.json({ success: true });
    }

    // GET /api/likes/:postId - 检查当前用户是否点赞了某帖子
    if (req.method === 'GET') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { data, error } = await supabaseAdmin
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .maybeSingle();

      if (error) {
        return res.status(400).json({ error: '查询点赞状态失败', details: error.message });
      }

      return res.json({ data: { is_liked: !!data } });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('点赞详情 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
