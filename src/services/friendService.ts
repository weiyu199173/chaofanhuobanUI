import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

const LOCAL_STORAGE_KEY = 'transcend_friendships';

export class FriendService {
  // 本地存储辅助函数
  private static saveFriendshipsToLocal(friendships: Friendship[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(friendships));
    }
  }

  private static loadFriendshipsFromLocal(): Friendship[] {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error('解析本地好友关系数据失败:', error);
          return [];
        }
      }
    }
    return [];
  }

  private static addFriendshipToLocal(friendship: Friendship): void {
    const friendships = this.loadFriendshipsFromLocal();
    const existingIndex = friendships.findIndex(f => f.id === friendship.id);
    if (existingIndex >= 0) {
      friendships[existingIndex] = friendship;
    } else {
      friendships.push(friendship);
    }
    this.saveFriendshipsToLocal(friendships);
  }

  private static removeFriendshipFromLocal(userId: string, friendId: string): void {
    const friendships = this.loadFriendshipsFromLocal();
    const filteredFriendships = friendships.filter(f => 
      !(f.user_id === userId && f.friend_id === friendId) && 
      !(f.user_id === friendId && f.friend_id === userId)
    );
    this.saveFriendshipsToLocal(filteredFriendships);
  }
  /**
   * 获取当前用户的好友列表
   */
  static async getFriends(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('获取好友列表失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取好友列表出错:', error);
      return [];
    }
  }

  /**
   * 发送好友请求
   */
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    // 创建本地好友请求对象
    const newFriendship: Friendship = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: fromUserId,
      friend_id: toUserId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 立即保存到本地
    this.addFriendshipToLocal(newFriendship);
    console.log('💾 好友请求已保存到本地:', newFriendship);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器保存');
      return true;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: fromUserId,
          friend_id: toUserId,
          status: 'pending'
        });

      if (error) {
        console.error('发送好友请求失败:', error);
        // 数据库失败时，仍然返回 true，因为本地已经保存了
        return true;
      }

      console.log('✅ 好友请求已发送到服务器！');
      return true;
    } catch (error) {
      console.error('发送好友请求出错:', error);
      // 出错时，仍然返回 true，因为本地已经保存了
      return true;
    }
  }

  /**
   * 接受好友请求
   */
  static async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (error) {
        console.error('接受好友请求失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('接受好友请求出错:', error);
      return false;
    }
  }

  /**
   * 拒绝好友请求
   */
  static async rejectFriendRequest(friendshipId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) {
        console.error('拒绝好友请求失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('拒绝好友请求出错:', error);
      return false;
    }
  }

  /**
   * 删除好友
   */
  static async removeFriend(userId: string, friendId: string): Promise<boolean> {
    // 立即从本地删除
    this.removeFriendshipFromLocal(userId, friendId);
    console.log('💾 好友关系已从本地删除:', userId, friendId);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器删除');
      return true;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        console.error('删除好友失败:', error);
        // 数据库失败时，仍然返回 true，因为本地已经删除了
        return true;
      }

      console.log('✅ 好友关系已从服务器删除！');
      return true;
    } catch (error) {
      console.error('删除好友出错:', error);
      // 出错时，仍然返回 true，因为本地已经删除了
      return true;
    }
  }

  /**
   * 检查两个用户是否是好友
   */
  static async areFriends(userId1: string, userId2: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
        .eq('status', 'accepted')
        .limit(1);

      if (error) {
        console.error('检查好友关系失败:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('检查好友关系出错:', error);
      return false;
    }
  }

  /**
   * 获取好友请求列表
   */
  static async getFriendRequests(userId: string): Promise<any[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_id(*)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('获取好友请求失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取好友请求出错:', error);
      return [];
    }
  }
}
