import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  uid?: string;
  nickname: string;
  avatar: string;
  gender?: string;
  bio: string;
  phone?: string;
  accountId?: string;
  region?: string;
  isAgent?: boolean;
  type?: 'human' | 'super' | 'twin';
  full_bio?: string;
  fullBio?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserService {
  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<any> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('获取用户失败:', error);
      return null;
    }
  }

  /**
   * 获取用户个人资料
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('获取用户资料失败:', error);
        return null;
      }

      if (data) {
        // 确保字段兼容
        const profile: UserProfile = {
          ...data,
          fullBio: data.full_bio || data.fullBio,
        };
        return profile;
      }

      return null;
    } catch (error) {
      console.error('获取用户资料出错:', error);
      return null;
    }
  }

  /**
   * 更新用户个人资料
   */
  static async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      // 转换字段名：fullBio -> full_bio, accountId -> accountId
      const dbData: any = { ...profileData };
      if (dbData.fullBio !== undefined) {
        dbData.full_bio = dbData.fullBio;
        delete dbData.fullBio;
      }
      // 确保使用正确的字段名
      if (dbData.accountId !== undefined) {
        dbData.accountId = dbData.accountId;
      }
      // 删除不应更新的字段
      delete dbData.uid;
      delete dbData.isAgent;
      delete dbData.type;
      delete dbData.id;
      
      dbData.updated_at = new Date().toISOString();

      console.log('正在更新用户资料:', userId, dbData);

      // 先尝试更新
      const { error: updateError } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', userId);

      if (updateError) {
        console.error('更新用户资料失败:', updateError);
        // 如果更新失败，尝试插入新记录
        console.log('尝试创建新用户记录...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            nickname: dbData.nickname || '用户',
            avatar: dbData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
            bio: dbData.bio || '',
            full_bio: dbData.full_bio || '',
            gender: dbData.gender || '',
            phone: dbData.phone || '',
            accountId: dbData.accountId || '',
            region: dbData.region || '',
          });
          
        if (insertError) {
          console.error('创建用户记录也失败:', insertError);
          return false;
        }
        console.log('✅ 用户记录创建成功');
        return true;
      }

      console.log('✅ 用户资料更新成功');
      return true;
    } catch (error) {
      console.error('更新用户资料出错:', error);
      return false;
    }
  }

  /**
   * 上传用户头像
   */
  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('上传头像失败:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('上传头像出错:', error);
      return null;
    }
  }

  /**
   * 获取所有用户
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error('获取用户列表失败:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      console.error('获取用户列表出错:', error);
      return [];
    }
  }

  /**
   * 搜索用户
   */
  static async searchUsers(query: string): Promise<UserProfile[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`nickname.ilike.%${query}%,bio.ilike.%${query}%`);

      if (error) {
        console.error('搜索用户失败:', error);
        return [];
      }

      return data as UserProfile[];
    } catch (error) {
      console.error('搜索用户出错:', error);
      return [];
    }
  }
}
