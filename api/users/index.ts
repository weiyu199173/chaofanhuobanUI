import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { authenticateRequest } from '../lib/auth';
import { setCorsHeaders, sanitizeString, isValidUUID, validateRequiredFields } from '../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // POST /api/users - 创建用户资料
    if (req.method === 'POST') {
      const { id, phone, email, nickname, avatar, bio, gender, region, account_id } = req.body;

      const missingField = validateRequiredFields(
        { id, nickname, account_id },
        ['id', 'nickname', 'account_id']
      );
      if (missingField) {
        return res.status(400).json({ error: missingField });
      }

      if (!isValidUUID(id)) {
        return res.status(400).json({ error: '无效的用户 ID', details: 'ID 必须是有效的 UUID 格式' });
      }

      const userData: Record<string, unknown> = {
        id,
        nickname: sanitizeString(nickname),
        account_id: sanitizeString(account_id),
        updated_at: new Date().toISOString(),
      };

      if (phone) userData.phone = sanitizeString(phone);
      if (email) userData.email = sanitizeString(email);
      if (avatar) userData.avatar = sanitizeString(avatar);
      if (bio) userData.bio = sanitizeString(bio);
      if (gender) userData.gender = sanitizeString(gender);
      if (region) userData.region = sanitizeString(region);

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ error: '创建用户失败', details: error.message });
      }

      return res.status(201).json({ data });
    }

    return res.status(405).json({ error: '方法不允许' });
  } catch (err) {
    console.error('用户创建 API 错误:', err);
    return res.status(500).json({ error: '内部服务器错误' });
  }
}
