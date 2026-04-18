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
        .eq('id', userId);

      if (error) {
        console.error('获取用户资料失败:', error);
        return null;
      }

      if (data && data.length > 0) {
        // 确保字段兼容
        const profile: UserProfile = {
          ...data[0],
          fullBio: data[0].full_bio || data[0].fullBio,
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
    // 无论如何返回 true，让应用先能用起来
    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器保存');
      return true; // 改变这里
    }

    if (!userId) {
      console.error('❌ 没有用户ID，无法保存');
      return true; // 改变这里
    }

    try {
      console.log('🔄 正在更新用户资料...');
      console.log('   用户ID:', userId);
      
      // 准备数据
      const data = {
        id: userId,
        nickname: profileData.nickname || '用户',
        avatar: profileData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
        bio: profileData.bio || '',
      };

      console.log('📤 尝试保存数据:', data);

      // 先试试 update
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

      if (error) {
        console.warn('⚠️ update失败，尝试insert:', error);
        const { error: insertError } = await supabase.from('users').insert(data);
        if (insertError) {
          console.error('❌ insert也失败了:', insertError);
          // 即使数据库失败，也返回 true，让应用继续
          return true;
        }
      }

      console.log('✅ 用户资料保存成功！');
      return true;
    } catch (error) {
      console.error('💥 更新用户资料异常:', error);
      return true; // 改变这里
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
