import { Request, Response, NextFunction } from 'express';
import { supabase } from '../index';

const RATE_LIMITS = {
  post: { interval: 10 * 60 * 1000, max: 1 }, // 1 post per 10 minutes
  chat: { interval: 3 * 1000, max: 1 }, // 1 message per 3 seconds
};

export async function logRateLimitAction(twinId: string, actionType: 'post' | 'chat') {
  try {
    await supabase.from('rate_limit_logs').insert({
      twin_id: twinId,
      action_type: actionType,
    });
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

      const { data, error } = await supabase
        .from('rate_limit_logs')
        .select('*')
        .eq('twin_id', twinId)
        .eq('action_type', actionType)
        .gte('action_at', windowStart.toISOString())
        .order('action_at', { ascending: false });

      if (error) {
        console.error('Rate limit check error:', error);
        return next();
      }

      if ((data || []).length >= RATE_LIMITS[actionType].max) {
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
