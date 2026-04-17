import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import { sanitizeString, isValidUUID, parsePagination } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/messages/conversation/:userId1/:userId2 - 获取两个用户之间的对话
 */
router.get('/conversation/:userId1/:userId2', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { userId1, userId2 } = req.params;

  if (!isValidUUID(userId1) || !isValidUUID(userId2)) {
    res.status(400).json({ error: '无效的用户 ID', details: '用户 ID 必须是有效的 UUID 格式' });
    return;
  }

  // 只允许查看自己参与的对话
  if (req.user!.id !== userId1 && req.user!.id !== userId2) {
    res.status(403).json({ error: '无权操作', details: '只能查看自己参与的对话' });
    return;
  }

  const { page, limit, offset } = parsePagination(req.query as Record<string, unknown>);

  try {
    const { data, error, count } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact' })
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(400).json({ error: '获取对话失败', details: error.message });
      return;
    }

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error('获取对话错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * GET /api/messages/:userId - 获取某用户的所有对话（每个对话返回最新一条消息）
 */
router.get('/:userId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'userId 必须是有效的 UUID 格式' });
    return;
  }

  // 只允许查看自己的对话列表
  if (req.user!.id !== userId) {
    res.status(403).json({ error: '无权操作', details: '只能查看自己的对话列表' });
    return;
  }

  try {
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
      res.status(400).json({ error: '获取对话列表失败', details: error.message });
      return;
    }

    // 按对话分组，每个对话只保留最新一条消息
    const conversationMap = new Map<string, Record<string, unknown>>();

    for (const msg of allMessages || []) {
      const senderId = msg.sender_id;
      const receiverId = msg.receiver_id;
      // 生成对话的唯一标识（两个用户 ID 排序后拼接）
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

    res.json({ data: conversations });
  } catch (err) {
    console.error('获取对话列表错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * POST /api/messages - 发送消息（需要认证）
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { receiver_id, content, type } = req.body;

  if (!receiver_id || !content) {
    res.status(400).json({ error: '缺少必填字段', details: 'receiver_id 和 content 不能为空' });
    return;
  }

  if (!isValidUUID(receiver_id)) {
    res.status(400).json({ error: '无效的接收者 ID', details: 'receiver_id 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const messageData: Record<string, unknown> = {
      sender_id: req.user!.id,
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
      res.status(400).json({ error: '发送消息失败', details: error.message });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    console.error('发送消息错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
