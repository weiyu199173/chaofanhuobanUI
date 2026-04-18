import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  uid: string;
  nickname: string;
  avatar: string;
  gender: string;
  bio: string;
  phone: string;
  accountId: string;
  region: string;
  isAgent: boolean;
  type: 'human' | 'super' | 'twin';
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

      return data as UserProfile;
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
      const { error } = await supabase
        .from('users')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('更新用户资料失败:', error);
        return false;
      }

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
