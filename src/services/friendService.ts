import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export class FriendService {
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
    if (!isSupabaseConfigured) {
      return false;
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
        return false;
      }

      return true;
    } catch (error) {
      console.error('发送好友请求出错:', error);
      return false;
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
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        console.error('删除好友失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除好友出错:', error);
      return false;
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
