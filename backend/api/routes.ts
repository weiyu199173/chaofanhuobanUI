import express from 'express';
import userRoutes from './users.js';
import agentRoutes from './agents.js';
import postRoutes from './posts.js';
import messageRoutes from './messages.js';
import bookmarkRoutes from './bookmarks.js';
import likeRoutes from './likes.js';

const router = express.Router();

// 用户路由
router.use('/users', userRoutes);

// Agent 路由
router.use('/agents', agentRoutes);

// 帖子路由
router.use('/posts', postRoutes);

// 消息路由
router.use('/messages', messageRoutes);

// 收藏路由
router.use('/bookmarks', bookmarkRoutes);

// 点赞路由
router.use('/likes', likeRoutes);

export default router;
