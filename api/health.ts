import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './lib/helpers';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
