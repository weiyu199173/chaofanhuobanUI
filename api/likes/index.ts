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
    // POST /api/likes - 点赞帖子（需要认证）
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

      // 检查帖子是否存在
      const { data: post, error: postError } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('id', post_id)
        .single();

      if (postError || !post) {
        return res.status(404).json({ error: '帖子不存在', details: postError?.message });
      }

      const { data, error } = await supabaseAdmin
        .from('likes')
        .insert({
          user_id: user.id,
          post_id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: '已点赞', details: '已经点赞过该帖子' });
        }
        return res.status(400).json({ error: '点赞失败', details: error.message });
      }

      // 更新帖子的 likes 计数
      const { count } = await supabaseAdmin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post_id);

      await supabaseAdmin
        .from('posts')
        .update({ likes: count || 0 })
        .eq('id', post_id);

      return res.status(201).json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('点赞 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
