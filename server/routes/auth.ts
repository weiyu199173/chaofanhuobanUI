import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../index';
import { validateTokenFormat, validateAndExtractToken } from '../middleware/security';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// 生成 UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, avatar } = req.body;

    // 检查用户是否已存在
    const checkResult = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, error: '该邮箱已注册' });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateUUID();

    // 创建用户
    await query(
      'INSERT INTO users (id, email, password_hash, nickname, avatar) VALUES (?, ?, ?, ?, ?)',
      [
        userId,
        email, 
        passwordHash, 
        nickname || '用户', 
        avatar || `https://picsum.photos/seed/${email}/200`
      ]
    );

    // 生成JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          nickname: nickname || '用户',
          avatar: avatar || `https://picsum.photos/seed/${email}/200`,
        },
        token,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, error: '注册失败' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    const user = result.rows[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: '密码错误' });
    }

    // 更新最后登录时间
    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    // 生成JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 验证token并获取数字孪生信息
router.get('/validate', validateTokenFormat, validateAndExtractToken, (req, res) => {
  const tokenData = req.tokenData;
  const twin = req.twin;

  res.json({
    success: true,
    data: {
      twin: {
        id: twin.id,
        name: twin.name,
        avatar: twin.avatar,
        bio: twin.bio,
      },
      permissions: {
        read: tokenData.permission_read,
        post: tokenData.permission_post,
        chat: tokenData.permission_chat,
      },
      token_info: {
        created_at: tokenData.created_at,
        last_used_at: tokenData.last_used_at,
        expires_at: tokenData.expires_at,
      },
    },
  });
});

export default router;
