import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, isValidUUID, parsePagination } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string' || !isValidUUID(userId)) {
    return res.status(400).json({ error: '无效的用户 ID', details: 'userId 必须是有效的 UUID 格式' });
  }

  try {
    // GET /api/bookmarks/:userId - 获取用户的收藏列表（包含帖子数据）
    if (req.method === 'GET') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 只允许查看自己的收藏
      if (user.id !== userId) {
        return res.status(403).json({ error: '无权操作', details: '只能查看自己的收藏' });
      }

      const query = req.query as Record<string, string | undefined>;
      const { page, limit, offset } = parsePagination(query);

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
        return res.status(400).json({ error: '获取收藏失败', details: error.message });
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

      return res.json({
        data: formattedData,
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
    console.error('收藏列表 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
