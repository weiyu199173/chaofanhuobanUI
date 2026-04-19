import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'transcend_user_profile';

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
  // 本地存储辅助函数
  private static saveToLocal(profile: UserProfile) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY + '_' + profile.id, JSON.stringify(profile));
    }
  }

  private static loadFromLocal(userId: string): UserProfile | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY + '_' + userId);
      if (data) {
        return JSON.parse(data);
      }
    }
    return null;
  }

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
    // 优先从本地读取
    const localProfile = this.loadFromLocal(userId);
    if (localProfile) {
      console.log('📱 从本地读取用户资料:', localProfile);
    }

    if (!isSupabaseConfigured) {
      return localProfile;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('获取用户资料失败:', error);
        return localProfile; // 数据库失败时返回本地数据
      }

      if (data && data.length > 0) {
        // 确保字段兼容
        const profile: UserProfile = {
          ...data[0],
          fullBio: data[0].full_bio || data[0].fullBio,
        };
        // 保存到本地
        this.saveToLocal(profile);
        return profile;
      }

      return localProfile; // 数据库没有时返回本地数据
    } catch (error) {
      console.error('获取用户资料出错:', error);
      return localProfile; // 出错时返回本地数据
    }
  }

  /**
   * 更新用户个人资料
   */
  static async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    // 先准备完整的用户数据
    const completeData: UserProfile = {
      id: userId,
      nickname: profileData.nickname || '用户',
      avatar: profileData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      bio: profileData.bio || '',
      gender: profileData.gender,
      phone: profileData.phone,
      accountId: profileData.accountId,
      region: profileData.region,
      full_bio: profileData.fullBio || profileData.full_bio,
      fullBio: profileData.fullBio || profileData.full_bio,
    };

    // 立即保存到本地（最重要！）
    this.saveToLocal(completeData);
    console.log('💾 用户资料已保存到本地:', completeData);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器保存');
      return true;
    }

    if (!userId) {
      console.error('❌ 没有用户ID，无法保存');
      return true;
    }

    try {
      console.log('🔄 正在同步到服务器...');
      
      // 准备数据库数据
      const dbData = {
        id: userId,
        nickname: completeData.nickname,
        avatar: completeData.avatar,
        bio: completeData.bio,
        full_bio: completeData.full_bio,
        gender: completeData.gender || null,
        phone: completeData.phone || null,
        accountId: completeData.accountId || null,
        region: completeData.region || null,
      };

      console.log('📤 尝试保存到数据库:', dbData);

      // 尝试 upsert（先查一下是否存在）
      const { data: existingData } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId);

      let dbError = null;
      if (existingData && existingData.length > 0) {
        // 存在，更新
        const { error } = await supabase
          .from('users')
          .update(dbData)
          .eq('id', userId);
        dbError = error;
      } else {
        // 不存在，插入
        const { error } = await supabase
          .from('users')
          .insert(dbData);
        dbError = error;
      }

      if (dbError) {
        console.error('❌ 数据库操作失败:', dbError);
        // 数据库失败时，仍然返回 true，因为本地已经保存了
        return true;
      }

      console.log('✅ 用户资料已同步到服务器！');
      return true;
    } catch (error) {
      console.error('💥 同步到服务器异常:', error);
      // 数据库失败时，仍然返回 true，因为本地已经保存了
      return true;
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
