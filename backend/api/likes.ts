import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import { isValidUUID } from '../middleware/validate.js';

const router = express.Router();

/**
 * POST /api/likes - 点赞帖子（需要认证）
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { post_id } = req.body;

  if (!post_id) {
    res.status(400).json({ error: '缺少必填字段', details: 'post_id 不能为空' });
    return;
  }

  if (!isValidUUID(post_id)) {
    res.status(400).json({ error: '无效的帖子 ID', details: 'post_id 必须是有效的 UUID 格式' });
    return;
  }

  try {
    // 检查帖子是否存在
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      res.status(404).json({ error: '帖子不存在', details: postError?.message });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('likes')
      .insert({
        user_id: req.user!.id,
        post_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: '已点赞', details: '已经点赞过该帖子' });
        return;
      }
      res.status(400).json({ error: '点赞失败', details: error.message });
      return;
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

    res.status(201).json({ data });
  } catch (err) {
    console.error('点赞错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * DELETE /api/likes/:postId - 取消点赞（需要认证）
 */
router.delete('/:postId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  if (!isValidUUID(postId)) {
    res.status(400).json({ error: '无效的帖子 ID', details: 'postId 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const { error, count } = await supabaseAdmin
      .from('likes')
      .delete({ count: 'exact' })
      .eq('user_id', req.user!.id)
      .eq('post_id', postId);

    if (error) {
      res.status(400).json({ error: '取消点赞失败', details: error.message });
      return;
    }

    if (count === 0) {
      res.status(404).json({ error: '点赞不存在', details: '未找到该点赞记录' });
      return;
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

    res.json({ success: true });
  } catch (err) {
    console.error('取消点赞错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * GET /api/likes/:postId/check - 检查当前用户是否点赞了某帖子
 */
router.get('/:postId/check', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { postId } = req.params;

  if (!isValidUUID(postId)) {
    res.status(400).json({ error: '无效的帖子 ID', details: 'postId 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('post_id', postId)
      .maybeSingle();

    if (error) {
      res.status(400).json({ error: '查询点赞状态失败', details: error.message });
      return;
    }

    res.json({ data: { is_liked: !!data } });
  } catch (err) {
    console.error('查询点赞状态错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
