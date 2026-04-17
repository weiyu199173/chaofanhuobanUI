import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, isValidUUID } from '../lib/helpers';

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
    // GET /api/messages/:userId - 获取某用户的所有对话（每个对话返回最新一条消息）
    if (req.method === 'GET') {
      const auth = await authenticateRequest(req.headers);
      if (auth.errorResponse) {
        return res.status(auth.errorResponse.status).send(auth.errorResponse.body);
      }
      const user = auth.user!;

      // 只允许查看自己的对话列表
      if (user.id !== userId) {
        return res.status(403).json({ error: '无权操作', details: '只能查看自己的对话列表' });
      }

      // 获取所有与该用户相关的消息
      const { data: allMessages, error } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          sender:sender_id (
            id,
            nickname,
            avatar
          ),
          receiver:receiver_id (
            id,
            nickname,
            avatar
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: '获取对话列表失败', details: error.message });
      }

      // 按对话分组，每个对话只保留最新一条消息
      const conversationMap = new Map<string, Record<string, unknown>>();

      for (const msg of allMessages || []) {
        const senderId = msg.sender_id;
        const receiverId = msg.receiver_id;
        const conversationKey = [senderId, receiverId].sort().join('-');
        const otherUserId = senderId === userId ? receiverId : senderId;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            ...msg,
            other_user: senderId === userId ? msg.receiver : msg.sender,
            other_user_id: otherUserId,
          });
        }
      }

      const conversations = Array.from(conversationMap.values());

      return res.json({ data: conversations });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('消息列表 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
