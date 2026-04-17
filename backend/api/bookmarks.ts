import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import { isValidUUID, parsePagination } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/bookmarks/:userId - 获取用户的收藏列表（包含帖子数据）
 */
router.get('/:userId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'userId 必须是有效的 UUID 格式' });
    return;
  }

  // 只允许查看自己的收藏
  if (req.user!.id !== userId) {
    res.status(403).json({ error: '无权操作', details: '只能查看自己的收藏' });
    return;
  }

  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  try {
    const { data, error, count } = await supabaseAdmin
      .from('bookmarks')
      .select(`
        created_at,
        post_id,
        posts:post_id (
          *,
          users:author_id (
            id,
            nickname,
            avatar
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(400).json({ error: '获取收藏失败', details: error.message });
      return;
    }

    // 格式化响应
    const formattedData = (data || []).map((bookmark: Record<string, unknown>) => {
      const post = bookmark.posts as Record<string, unknown>;
      return {
        bookmarked_at: bookmark.created_at,
        ...(post || {}),
        author_name: (post?.users as Record<string, unknown>)?.nickname || null,
        author_avatar: (post?.users as Record<string, unknown>)?.avatar || null,
        users: undefined,
        posts: undefined,
      };
    });

    res.json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('获取收藏错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * POST /api/bookmarks - 添加收藏（需要认证）
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
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert({
        user_id: req.user!.id,
        post_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: '已收藏', details: '该帖子已被收藏' });
        return;
      }
      res.status(400).json({ error: '添加收藏失败', details: error.message });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    console.error('添加收藏错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * DELETE /api/bookmarks/:userId/:postId - 取消收藏（需要认证）
 */
router.delete('/:userId/:postId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { userId, postId } = req.params;

  if (!isValidUUID(userId) || !isValidUUID(postId)) {
    res.status(400).json({ error: '无效的 ID', details: 'userId 和 postId 必须是有效的 UUID 格式' });
    return;
  }

  // 只能取消自己的收藏
  if (req.user!.id !== userId) {
    res.status(403).json({ error: '无权操作', details: '只能取消自己的收藏' });
    return;
  }

  try {
    const { error, count } = await supabaseAdmin
      .from('bookmarks')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      res.status(400).json({ error: '取消收藏失败', details: error.message });
      return;
    }

    if (count === 0) {
      res.status(404).json({ error: '收藏不存在', details: '未找到该收藏记录' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('取消收藏错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
