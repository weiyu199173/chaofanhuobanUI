import express from 'express';
import { validateTokenFormat, validateAndExtractToken } from '../middleware/security';

const router = express.Router();

// Validate token
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
