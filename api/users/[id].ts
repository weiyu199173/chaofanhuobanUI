import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, sanitizeString, isValidUUID } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !isValidUUID(id)) {
    return res.status(400).json({ error: '无效的用户 ID', details: 'ID 必须是有效的 UUID 格式' });
  }

  try {
    // GET /api/users/:id - 获取用户资料（包含 agent 数量）
    if (req.method === 'GET') {
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: '用户不存在', details: error?.message });
      }

      // 获取该用户的 agent 数量
      const { count: agentCount } = await supabaseAdmin
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      return res.json({
        data: {
          ...user,
          agent_count: agentCount || 0,
        },
      });
    }

    // PUT /api/users/:id - 更新用户资料（需要认证，只能更新自己的资料）
    if (req.method === 'PUT') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 只能更新自己的资料
      if (user.id !== id) {
        return res.status(403).json({ error: '无权操作', details: '只能更新自己的用户资料' });
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      const allowedFields = ['phone', 'email', 'nickname', 'avatar', 'bio', 'gender', 'region'];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = sanitizeString(req.body[field]);
        }
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return res.status(400).json({ error: '更新用户失败', details: error?.message });
      }

      return res.json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('用户详情 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
