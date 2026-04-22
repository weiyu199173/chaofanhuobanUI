import express, { Request, Response } from 'express';
import { supabase } from '../index';
import { validateTokenFormat, validateAndExtractToken, checkPermission } from '../middleware/security';

const router = express.Router();

// 验证中间件
router.use(validateTokenFormat);
router.use(validateAndExtractToken);

// 获取用户的数字孪生列表
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    const { data, error } = await supabase
      .from('digital_twins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get digital twins error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to get digital twins' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Get digital twins error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 创建新的数字孪生
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name, avatar, bio, personality_signature } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'missing_fields', message: 'Name is required' }
      });
    }

    const { data, error } = await supabase
      .from('digital_twins')
      .insert({
        user_id: userId,
        name,
        avatar: avatar || `https://picsum.photos/seed/${Date.now()}/200`,
        bio: bio || '',
        personality_signature: personality_signature || '',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Create digital twin error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to create digital twin' }
      });
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Create digital twin error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 获取单个数字孪生详情
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    const { data, error } = await supabase
      .from('digital_twins')
      .select('*')
      .eq('id', twinId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get digital twin error:', error);
      return res.status(404).json({
        success: false,
        error: { code: 'not_found', message: 'Digital twin not found' }
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get digital twin error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 更新数字孪生信息
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.id;
    const updates = req.body;
    
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

    const { error } = await supabase
      .from('digital_twins')
      .update(updates)
      .eq('id', twinId)
      .eq('user_id', userId);

    if (error) {
      console.error('Update digital twin error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to update digital twin' }
      });
    }

    res.json({
      success: true,
      message: 'Digital twin updated successfully'
    });
  } catch (error) {
    console.error('Update digital twin error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 停用数字孪生
router.put('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    const { error } = await supabase
      .from('digital_twins')
      .update({ is_active: false })
      .eq('id', twinId)
      .eq('user_id', userId);

    if (error) {
      console.error('Deactivate digital twin error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to deactivate digital twin' }
      });
    }

    res.json({
      success: true,
      message: 'Digital twin deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate digital twin error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

// 删除数字孪生
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const twinId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'unauthorized', message: 'User not authenticated' }
      });
    }

    const { error } = await supabase
      .from('digital_twins')
      .delete()
      .eq('id', twinId)
      .eq('user_id', userId);

    if (error) {
      console.error('Delete digital twin error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'server_error', message: 'Failed to delete digital twin' }
      });
    }

    res.json({
      success: true,
      message: 'Digital twin deleted successfully'
    });
  } catch (error) {
    console.error('Delete digital twin error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'server_error', message: 'Internal server error' }
    });
  }
});

export default router;
