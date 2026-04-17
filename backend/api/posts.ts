import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { sanitizeString, isValidUUID, parsePagination } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/posts - 获取所有帖子（分页，包含作者信息）
 */
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  try {
    // 使用 JOIN 获取作者信息
    const { data, error, count } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:author_id (
          id,
          nickname,
          avatar
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(400).json({ error: '获取帖子失败', details: error.message });
      return;
    }

    // 如果用户已登录，获取其点赞和收藏状态
    let likedPostIds: Set<string> = new Set();
    let bookmarkedPostIds: Set<string> = new Set();

    if (req.user) {
      const [likesRes, bookmarksRes] = await Promise.all([
        supabaseAdmin
          .from('likes')
          .select('post_id')
          .eq('user_id', req.user.id),
        supabaseAdmin
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', req.user.id),
      ]);

      if (likesRes.data) {
        likedPostIds = new Set(likesRes.data.map((l: { post_id: string }) => l.post_id));
      }
      if (bookmarksRes.data) {
        bookmarkedPostIds = new Set(bookmarksRes.data.map((b: { post_id: string }) => b.post_id));
      }
    }

    // 格式化响应，将作者信息平铺
    const formattedData = (data || []).map((post: Record<string, unknown>) => ({
      ...post,
      author_name: (post.users as Record<string, unknown>)?.nickname || null,
      author_avatar: (post.users as Record<string, unknown>)?.avatar || null,
      is_liked: likedPostIds.has(post.id as string),
      is_bookmarked: bookmarkedPostIds.has(post.id as string),
      users: undefined, // 移除嵌套的 users 对象
    }));

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
    console.error('获取帖子错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * GET /api/posts/user/:userId - 获取某用户的帖子
 */
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'userId 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const { data, error, count } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:author_id (
          id,
          nickname,
          avatar
        )
      `, { count: 'exact' })
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(400).json({ error: '获取帖子失败', details: error.message });
      return;
    }

    const formattedData = (data || []).map((post: Record<string, unknown>) => ({
      ...post,
      author_name: (post.users as Record<string, unknown>)?.nickname || null,
      author_avatar: (post.users as Record<string, unknown>)?.avatar || null,
      users: undefined,
    }));

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
    console.error('获取用户帖子错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * POST /api/posts - 创建帖子（需要认证）
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { content, image, is_agent, agent_type } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: '缺少必填字段', details: 'content 不能为空' });
    return;
  }

  try {
    const postData: Record<string, unknown> = {
      author_id: req.user!.id,
      content: sanitizeString(content),
      likes: 0,
      comments: 0,
      is_agent: !!is_agent,
      updated_at: new Date().toISOString(),
    };

    if (image) postData.image = sanitizeString(image);
    if (agent_type) postData.agent_type = sanitizeString(agent_type);

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert(postData)
      .select(`
        *,
        users:author_id (
          id,
          nickname,
          avatar
        )
      `)
      .single();

    if (error) {
      res.status(400).json({ error: '创建帖子失败', details: error.message });
      return;
    }

    const formattedData = {
      ...data,
      author_name: (data.users as Record<string, unknown>)?.nickname || null,
      author_avatar: (data.users as Record<string, unknown>)?.avatar || null,
      users: undefined,
    };

    res.status(201).json({ data: formattedData });
  } catch (err) {
    console.error('创建帖子错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * DELETE /api/posts/:id - 删除帖子（需要认证，只能删除自己的帖子）
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的帖子 ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  try {
    // 先检查帖子是否属于当前用户
    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      res.status(404).json({ error: '帖子不存在', details: fetchError?.message });
      return;
    }

    if (existingPost.author_id !== req.user!.id) {
      res.status(403).json({ error: '无权操作', details: '只能删除自己的帖子' });
      return;
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
      res.status(400).json({ error: '删除帖子失败', details: error.message });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('删除帖子错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
