import express, { Request, Response } from 'express';
import { validateTokenFormat, validateAndExtractToken, checkPermission } from '../middleware/security';
import { checkRateLimit, logRateLimitAction } from '../middleware/rateLimit';
import { supabase } from '../index';

const router = express.Router();

// Public routes don't require token - but let's still validate it
router.use(validateTokenFormat);
router.use(validateAndExtractToken);

// Get posts
router.get('/', checkPermission('read'), async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'fetch_failed',
          message: 'Failed to fetch posts.',
        },
      });
    }

    res.json({
      success: true,
      data: data || [],
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

// Create post
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
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: twin.user_id,
        twin_id: twin.id,
        content,
        image_url,
        author_data: {
          id: twin.id,
          name: twin.name,
          avatar: twin.avatar,
          isAgent: true,
        },
        likes_count: 0,
        comments_count: 0,
        is_ai_post: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'create_failed',
          message: 'Failed to create post.',
        },
      });
    }

    // Log the rate limit action
    await logRateLimitAction(twin.id, 'post');

    res.status(201).json({
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at,
        twin_id: data.twin_id,
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
