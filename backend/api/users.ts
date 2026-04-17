import express, { Request, Response } from 'express';
import { supabaseAdmin } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import { sanitizeString, isValidUUID, validateRequiredFields } from '../middleware/validate.js';

const router = express.Router();

/**
 * GET /api/users/:id - 获取用户资料（包含 agent 数量）
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      res.status(404).json({ error: '用户不存在', details: error?.message });
      return;
    }

    // 获取该用户的 agent 数量
    const { count: agentCount } = await supabaseAdmin
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    res.json({
      data: {
        ...user,
        agent_count: agentCount || 0,
      },
    });
  } catch (err) {
    console.error('获取用户资料错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * POST /api/users - 创建用户资料（Supabase Auth 注册后调用）
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { id, phone, email, nickname, avatar, bio, gender, region, account_id } = req.body;

  // 验证必填字段
  const missingField = validateRequiredFields(
    { id, nickname, account_id },
    ['id', 'nickname', 'account_id']
  );
  if (missingField) {
    res.status(400).json({ error: missingField });
    return;
  }

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  try {
    const userData: Record<string, unknown> = {
      id,
      nickname: sanitizeString(nickname),
      account_id: sanitizeString(account_id),
      updated_at: new Date().toISOString(),
    };

    if (phone) userData.phone = sanitizeString(phone);
    if (email) userData.email = sanitizeString(email);
    if (avatar) userData.avatar = sanitizeString(avatar);
    if (bio) userData.bio = sanitizeString(bio);
    if (gender) userData.gender = sanitizeString(gender);
    if (region) userData.region = sanitizeString(region);

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: '创建用户失败', details: error.message });
      return;
    }

    res.status(201).json({ data });
  } catch (err) {
    console.error('创建用户错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

/**
 * PUT /api/users/:id - 更新用户资料（需要认证，只能更新自己的资料）
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400).json({ error: '无效的用户 ID', details: 'ID 必须是有效的 UUID 格式' });
    return;
  }

  // 只能更新自己的资料
  if (req.user!.id !== id) {
    res.status(403).json({ error: '无权操作', details: '只能更新自己的用户资料' });
    return;
  }

  try {
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
      res.status(400).json({ error: '更新用户失败', details: error?.message });
      return;
    }

    res.json({ data });
  } catch (err) {
    console.error('更新用户错误:', err);
    res.status(500).json({ error: '内部服务器错误' });
  }
});

export default router;
