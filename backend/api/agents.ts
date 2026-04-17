import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import { sanitizeString, isValidUUID, validateRequiredFields } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/agents/user/:userId - 获取某用户的所有 agents
 */
router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!isValidUUID(userId)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'userId 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(400).json({ error: '获取 agents 失败', details: error.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    console.error('获取 agents 错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * POST /api/agents - 创建 agent（需要认证）
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { name, avatar, bio, sync_rate, status, type, traits } = req.body;

  const missingField = validateRequiredFields(
    { name, type },
    ['name', 'type']
  );
  if (missingField) {
    res.status(400).json({ error: missingField });
    return;
  }

  if (!['super', 'twin'].includes(type)) {
    res.status(400).json({ error: '无效的 agent 类型', details: 'type 必须是 super 或 twin' });
    return;
  }

  try {
    const agentData: Record<string, unknown> = {
      user_id: req.user!.id,
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
      res.status(400).json({ error: '创建 agent 失败', details: error.message });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    console.error('创建 agent 错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * PUT /api/agents/:id - 更新 agent（需要认证，只能更新自己的 agents）
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的 agent ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  try {
    // 先检查 agent 是否属于当前用户
    const { data: existingAgent, error: fetchError } = await supabaseAdmin
      .from('agents')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAgent) {
      res.status(404).json({ error: 'Agent 不存在', details: fetchError?.message });
      return;
    }

    if (existingAgent.user_id !== req.user!.id) {
      res.status(403).json({ error: '无权操作', details: '只能更新自己的 agent' });
      return;
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
      res.status(400).json({ error: '更新 agent 失败', details: error.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    console.error('更新 agent 错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * DELETE /api/agents/:id - 删除 agent（需要认证，只能删除自己的 agents）
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的 agent ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  try {
    // 先检查 agent 是否属于当前用户
    const { data: existingAgent, error: fetchError } = await supabaseAdmin
      .from('agents')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAgent) {
      res.status(404).json({ error: 'Agent 不存在', details: fetchError?.message });
      return;
    }

    if (existingAgent.user_id !== req.user!.id) {
      res.status(403).json({ error: '无权操作', details: '只能删除自己的 agent' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: '删除 agent 失败', details: error.message });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('删除 agent 错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
