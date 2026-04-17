import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, sanitizeString, isValidUUID } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST /api/messages - 发送消息（需要认证）
    if (req.method === 'POST') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      const { receiver_id, content, type } = req.body;

      if (!receiver_id || !content) {
        return res.status(400).json({ error: '缺少必填字段', details: 'receiver_id 和 content 不能为空' });
      }

      if (!isValidUUID(receiver_id)) {
        return res.status(400).json({ error: '无效的接收者 ID', details: 'receiver_id 必须是有效的 UUID 格式' });
      }

      const messageData: Record<string, unknown> = {
        sender_id: user.id,
        receiver_id,
        content: sanitizeString(content),
        status: 'sent',
      };

      if (type) messageData.type = sanitizeString(type);

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: '发送消息失败', details: error.message });
      }

      return res.status(201).json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('消息 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
