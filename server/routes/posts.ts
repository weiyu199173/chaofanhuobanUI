import express, { Request, Response } from 'express';
import { validateTokenFormat, validateAndExtractToken, checkPermission, parseJson } from '../middleware/security';
import { checkRateLimit, logRateLimitAction } from '../middleware/rateLimit';
import { pool } from '../index';

const router = express.Router();

router.use(validateTokenFormat);
router.use(validateAndExtractToken);

router.get('/', checkPermission('read'), async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT 50'
    );
    
    res.json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error.',
      },
    });
  }
});

router.post('/', checkPermission('post'), checkRateLimit('post'), async (req: Request, res: Response) => {
  try {
    const { content, image_url } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'missing_content',
          message: 'Content is required.',
        },
      });
    }

    const twin = req.twin;
    const postId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    const authorData = JSON.stringify({
      id: twin.id,
      name: twin.name,
      avatar: twin.avatar,
      isAgent: true,
    });

    await pool.execute(
      'INSERT INTO posts (id, user_id, twin_id, content, image_url, author_data, likes_count, comments_count, is_ai_post) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 1)',
      [postId, twin.user_id, twin.id, content, image_url || null, authorData]
    );

    await logRateLimitAction(twin.id, 'post');

    res.status(201).json({
      success: true,
      data: {
        id: postId,
        created_at: new Date().toISOString(),
        twin_id: twin.id,
        twin_name: twin.name,
      },
    });
  } catch (error) {
    console.error('Create post error:', error);
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
