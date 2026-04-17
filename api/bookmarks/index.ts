import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, isValidUUID } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST /api/bookmarks - 添加收藏（需要认证）
    if (req.method === 'POST') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { post_id } = req.body;

      if (!post_id) {
        return res.status(400).json({ error: '缺少必填字段', details: 'post_id 不能为空' });
      }

      if (!isValidUUID(post_id)) {
        return res.status(400).json({ error: '无效的帖子 ID', details: 'post_id 必须是有效的 UUID 格式' });
      }

      const { data, error } = await supabaseAdmin
        .from('bookmarks')
        .insert({
          user_id: user.id,
          post_id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: '已收藏', details: '该帖子已被收藏' });
        }
        return res.status(400).json({ error: '添加收藏失败', details: error.message });
      }

      return res.status(201).json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('收藏创建 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
