import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserService } from './userService';

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
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('获取好友列表失败:', error);
        return [];
      }

      // 手动获取好友信息
      const friends = [];
      for (const friendship of friendships || []) {
        const friendProfile = await UserService.getUserProfile(friendship.friend_id);
        if (friendProfile) {
          friends.push({
            ...friendship,
            friend: friendProfile
          });
        }
      }

      return friends;
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
      // 首先获取好友请求信息
      const { data: friendship, error: fetchError } = await supabase
        .from('friendships')
        .select('*')
        .eq('id', friendshipId)
        .single();

      if (fetchError || !friendship) {
        console.error('获取好友请求失败:', fetchError);
        return false;
      }

      // 更新请求状态
      const { error: updateError } = await supabase
        .from('friendships')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (updateError) {
        console.error('接受好友请求失败:', updateError);
        return false;
      }

      // 创建反向关系
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id: friendship.friend_id,
          friend_id: friendship.user_id,
          status: 'accepted'
        });

      if (insertError) {
        console.error('创建反向好友关系失败:', insertError);
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
      // 删除两个方向的关系
      const { error: error1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      const { error: error2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (error1 || error2) {
        console.error('删除好友失败:', { error1, error2 });
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
      // 检查任一方向
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId1)
        .eq('friend_id', userId2)
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
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('获取好友请求失败:', error);
        return [];
      }

      // 手动获取请求者信息
      const requests = [];
      for (const friendship of friendships || []) {
        const requesterProfile = await UserService.getUserProfile(friendship.user_id);
        if (requesterProfile) {
          requests.push({
            ...friendship,
            requester: requesterProfile
          });
        }
      }

      return requests;
    } catch (error) {
      console.error('获取好友请求出错:', error);
      return [];
    }
  }
}
