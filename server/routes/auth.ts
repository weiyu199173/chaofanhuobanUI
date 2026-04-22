import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../index';

const router = express.Router();

// 生成JWT Token
const generateToken = (userId: string, email: string) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 生成随机Token
const generateRandomToken = (length: number = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 注册路由
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, nickname, avatar } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing_fields',
          message: 'Email and password are required.',
        },
      });
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'user_exists',
          message: 'User with this email already exists.',
        },
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        nickname,
        avatar,
      })
      .select('id, email, nickname, avatar')
      .single();

    if (userError) {
      console.error('Create user error:', userError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'create_user_failed',
          message: 'Failed to create user.',
        },
      });
    }

    // 生成Token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error.',
      },
    });
  }
});

// 登录路由
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing_fields',
          message: 'Email and password are required.',
        },
      });
    }

    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, nickname, avatar')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password.',
        },
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid_credentials',
          message: 'Invalid email or password.',
        },
      });
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // 生成Token
    const token = generateToken(user.id, user.email);

    // 生成Agent Token（用于AI工具接入）
    const agentToken = generateRandomToken();
    const agentTokenHash = await bcrypt.hash(agentToken, 10);

    // 保存Agent Token
    await supabase
      .from('agent_tokens')
      .insert({
        user_id: user.id,
        name: 'Login Token',
        token_hash: agentTokenHash,
        permissions: { read: true, post: true, chat: true },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    res.json({
      success: true,
      data: {
        token,
        agent_token: agentToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error.',
      },
    });
  }
});

// 验证Token路由
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'missing_token',
          message: 'Authorization token is required.',
        },
      });
    }

    // 验证JWT Token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid_token',
          message: 'Invalid or expired token.',
        },
      });
    }

    // 查找用户
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, nickname, avatar, created_at')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'user_not_found',
          message: 'User not found.',
        },
      });
    }

    // 查找数字孪生
    const { data: digitalTwins } = await supabase
      .from('digital_twins')
      .select('id, name, avatar, bio, personality_signature, is_active, created_at')
      .eq('user_id', user.id);

    res.json({
      success: true,
      data: {
        user,
        digital_twins: digitalTwins || [],
        token_valid: true,
      },
    });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error.',
      },
    });
  }
});

export default router;
