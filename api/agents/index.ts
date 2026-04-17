import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, sanitizeString, isValidUUID, validateRequiredFields } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST /api/agents - 创建 agent（需要认证）
    if (req.method === 'POST') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { name, avatar, bio, sync_rate, status, type, traits } = req.body;

      const missingField = validateRequiredFields({ name, type }, ['name', 'type']);
      if (missingField) {
        return res.status(400).json({ error: missingField });
      }

      if (!['super', 'twin'].includes(type)) {
        return res.status(400).json({ error: '无效的 agent 类型', details: 'type 必须是 super 或 twin' });
      }

      const agentData: Record<string, unknown> = {
        user_id: user.id,
        name: sanitizeString(name),
        type: sanitizeString(type),
        updated_at: new Date().toISOString(),
      };

      if (avatar) agentData.avatar = sanitizeString(avatar);
      if (bio) agentData.bio = sanitizeString(bio);
      if (sync_rate !== undefined) agentData.sync_rate = Number(sync_rate);
      if (status) agentData.status = sanitizeString(status);
      if (traits && Array.isArray(traits)) agentData.traits = traits.map(String);

      const { data, error } = await supabaseAdmin
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: '创建 agent 失败', details: error.message });
      }

      return res.status(201).json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('Agent 创建 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
