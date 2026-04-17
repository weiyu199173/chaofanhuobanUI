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
    return res.status(400).json({ error: '无效的 agent ID', details: 'ID 必须是有效的 UUID 格式' });
  }

  try {
    // PUT /api/agents/:id - 更新 agent（需要认证，只能更新自己的 agents）
    if (req.method === 'PUT') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 先检查 agent 是否属于当前用户
      const { data: existingAgent, error: fetchError } = await supabaseAdmin
        .from('agents')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingAgent) {
        return res.status(404).json({ error: 'Agent 不存在', details: fetchError?.message });
      }

      if (existingAgent.user_id !== user.id) {
        return res.status(403).json({ error: '无权操作', details: '只能更新自己的 agent' });
      }

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      const allowedFields = ['name', 'avatar', 'bio', 'sync_rate', 'status', 'type', 'traits'];
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === 'sync_rate') {
            updateData[field] = Number(req.body[field]);
          } else if (field === 'traits' && Array.isArray(req.body[field])) {
            updateData[field] = req.body[field].map(String);
          } else {
            updateData[field] = sanitizeString(req.body[field]);
          }
        }
      }

      const { data, error } = await supabaseAdmin
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: '更新 agent 失败', details: error.message });
      }

      return res.json({ data });
    }

    // DELETE /api/agents/:id - 删除 agent（需要认证，只能删除自己的 agents）
    if (req.method === 'DELETE') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 先检查 agent 是否属于当前用户
      const { data: existingAgent, error: fetchError } = await supabaseAdmin
        .from('agents')
        .select('user_id')
        .eq('id', id)
        .single();

      if (fetchError || !existingAgent) {
        return res.status(404).json({ error: 'Agent 不存在', details: fetchError?.message });
      }

      if (existingAgent.user_id !== user.id) {
        return res.status(403).json({ error: '无权操作', details: '只能删除自己的 agent' });
      }

      const { error } = await supabaseAdmin
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(400).json({ error: '删除 agent 失败', details: error.message });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('Agent 详情 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
