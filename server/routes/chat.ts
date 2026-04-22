import express, { Request, Response } from 'express';
import { supabase } from '../index';
import { validateTokenFormat, validateAndExtractToken, checkPermission } from '../middleware/security';
import { checkRateLimit, logRateLimitAction } from '../middleware/rateLimit';

const router = express.Router();

// 验证中间件
router.use(validateTokenFormat);
router.use(validateAndExtractToken);

// 获取与数字孪生的聊天记录
router.get('/:twinId', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.twinId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    // 验证数字孪生属于当前用户
    const { data: twin, error: twinError } = await supabase
      .from('digital_twins')
      .select('id')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (twinError || !twin) {
      return res.status(404).json({
        success: false,
        error: { code: 'not_found', message: 'Digital twin not found' }
      });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('twin_id', twinId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get chat messages error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to get chat messages' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 发送消息
router.post('/:twinId', checkRateLimit('chat'), async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.twinId;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { code: 'missing_fields', message: 'Content is required' }
      });
    }

    // 验证数字孪生属于当前用户
    const { data: twin, error: twinError } = await supabase
      .from('digital_twins')
      .select('id, name, avatar')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (twinError || !twin) {
      return res.status(404).json({
        success: false,
        error: { code: 'not_found', message: 'Digital twin not found' }
      });
    }

    // 保存用户消息
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        twin_id: twinId,
        user_id: userId,
        content,
        is_from_twin: false
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('Save user message error:', userMessageError);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to send message' }
      });
    }

    // 记录速率限制
    await logRateLimitAction(twinId, 'chat');

    // TODO: 这里可以添加 AI 回复逻辑
    // 例如调用外部 AI 模型生成回复

    res.status(201).json({
      success: true,
      data: userMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 删除消息
router.delete('/message/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const messageId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete message error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to delete message' }
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

export default router;
