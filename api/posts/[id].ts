import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, isValidUUID } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !isValidUUID(id)) {
    return res.status(400).json({ error: '无效的帖子 ID', details: 'ID 必须是有效的 UUID 格式' });
  }

  try {
    // DELETE /api/posts/:id - 删除帖子（需要认证，只能删除自己的帖子）
    if (req.method === 'DELETE') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 先检查帖子是否属于当前用户
      const { data: existingPost, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select('author_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingPost) {
        return res.status(404).json({ error: '帖子不存在', details: fetchError?.message });
      }

      if (existingPost.author_id !== user.id) {
        return res.status(403).json({ error: '无权操作', details: '只能删除自己的帖子' });
      }

      // 删除帖子相关的 likes 和 bookmarks
      await Promise.all([
        supabaseAdmin.from('likes').delete().eq('post_id', id),
        supabaseAdmin.from('bookmarks').delete().eq('post_id', id),
      ]);

      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: '删除帖子失败', details: error.message });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('帖子详情 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
