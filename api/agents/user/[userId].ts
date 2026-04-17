import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';
import { setCorsHeaders, isValidUUID } from '../../lib/helpers';

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
    // GET /api/agents/user/:userId - 获取某用户的所有 agents
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: '获取 agents 失败', details: error.message });
      }

      return res.json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('Agent 用户列表 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
