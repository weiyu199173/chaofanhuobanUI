import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest, optionalAuthenticateRequest } from '../lib/auth';
import { setCorsHeaders, sanitizeString, isValidUUID, parsePagination } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET /api/posts - 获取所有帖子（分页，包含作者信息）
    if (req.method === 'GET') {
      const query = req.query as Record<string, string | undefined>;
      const { page, limit, offset } = parsePagination(query);

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
        return res.status(400).json({ error: '获取帖子失败', details: error.message });
      }

      // 如果用户已登录，获取其点赞和收藏状态
      let likedPostIds: Set<string> = new Set();
      let bookmarkedPostIds: Set<string> = new Set();

      const user = await optionalAuthenticateRequest(req.headers);
      if (user) {
        const [likesRes, bookmarksRes] = await Promise.all([
          supabaseAdmin.from('likes').select('post_id').eq('user_id', user.id),
          supabaseAdmin.from('bookmarks').select('post_id').eq('user_id', user.id),
        ]);

        if (likesRes.data) {
          likedPostIds = new Set(likesRes.data.map((l: { post_id: string }) => l.post_id));
        }
        if (bookmarksRes.data) {
          bookmarkedPostIds = new Set(bookmarksRes.data.map((b: { post_id: string }) => b.post_id));
        }
      }

      const formattedData = (data || []).map((post: Record<string, unknown>) => ({
        ...post,
        author_name: (post.users as Record<string, unknown>)?.nickname || null,
        author_avatar: (post.users as Record<string, unknown>)?.avatar || null,
        is_liked: likedPostIds.has(post.id as string),
        is_bookmarked: bookmarkedPostIds.has(post.id as string),
        users: undefined,
      }));

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

    // POST /api/posts - 创建帖子（需要认证）
    if (req.method === 'POST') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { content, image, is_agent, agent_type } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: '缺少必填字段', details: 'content 不能为空' });
      }

      const postData: Record<string, unknown> = {
        author_id: user.id,
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
        return res.status(400).json({ error: '创建帖子失败', details: error.message });
      }

      const formattedData = {
        ...data,
        author_name: (data.users as Record<string, unknown>)?.nickname || null,
        author_avatar: (data.users as Record<string, unknown>)?.avatar || null,
        users: undefined,
      };

      return res.status(201).json({ data: formattedData });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('帖子 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
