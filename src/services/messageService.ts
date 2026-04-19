import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
}

export class MessageService {
  /**
   * 发送消息
   */
  static async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          status: 'sent'
        })
        .select()
        .single();

      if (error) {
        console.error('发送消息失败:', error);
        return null;
      }

      return data as Message;
    } catch (error) {
      console.error('发送消息出错:', error);
      return null;
    }
  }

  /**
   * 获取与特定用户的聊天记录
   */
  static async getChatMessages(userId: string, otherUserId: string): Promise<Message[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('获取聊天记录失败:', error);
        return [];
      }

      return data as Message[];
    } catch (error) {
      console.error('获取聊天记录出错:', error);
      return [];
    }
  }

  /**
   * 更新消息状态
   */
  static async updateMessageStatus(messageId: string, status: 'delivered' | 'read'): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: status })
        .eq('id', messageId);

      if (error) {
        console.error('更新消息状态失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('更新消息状态出错:', error);
      return false;
    }
  }

  /**
   * 标记所有消息为已读
   */
  static async markAllAsRead(senderId: string, receiverId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId);

      if (error) {
        console.error('标记消息为已读失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('标记消息为已读出错:', error);
      return false;
    }
  }

  /**
   * 订阅消息更新
   */
  static subscribeToMessages(callback: (messages: Message[]) => void) {
    if (!isSupabaseConfigured) {
      return () => {};
    }

    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, async () => {
        // 这里可以根据需要获取最新的消息
        callback([]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }
}