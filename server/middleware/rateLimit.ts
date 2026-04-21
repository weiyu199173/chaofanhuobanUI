import { Request, Response, NextFunction } from 'express';
import { pool } from '../index';

const RATE_LIMITS = {
  post: { interval: 10 * 60 * 1000, max: 1 },
  chat: { interval: 3 * 1000, max: 1 },
};

export async function logRateLimitAction(twinId: string, actionType: 'post' | 'chat') {
  try {
    await pool.execute(
      'INSERT INTO rate_limits (twin_id, action_type, action_at) VALUES (?, ?, NOW())',
      [twinId, actionType]
    );
  } catch (error) {
    console.error('Failed to log rate limit action:', error);
  }
}

export function checkRateLimit(actionType: 'post' | 'chat') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const twinId = req.twin?.id;
    
    if (!twinId) {
      return next();
    }

    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - RATE_LIMITS[actionType].interval);

      const [rows] = await pool.execute(
        'SELECT * FROM rate_limits WHERE twin_id = ? AND action_type = ? AND action_at >= ? ORDER BY action_at DESC',
        [twinId, actionType, windowStart]
      );

      const data = rows as any[];

      if (data.length >= RATE_LIMITS[actionType].max) {
        const lastAction = new Date(data[0].action_at);
        const waitTimeMs = RATE_LIMITS[actionType].interval - (now.getTime() - lastAction.getTime());
        const waitSeconds = Math.ceil(waitTimeMs / 1000);
        
        return res.status(429).json({
          success: false,
          error: {
            code: 'rate_limit_exceeded',
            message: `Rate limit exceeded. Please wait ${waitSeconds} second${waitSeconds > 1 ? 's' : ''}.`,
            retry_after: waitSeconds,
          },
        });
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  };
}
