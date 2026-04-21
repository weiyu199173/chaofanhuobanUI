import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactProfile } from '../types';
import { UserService } from './userService';

const LOCAL_STORAGE_KEY = 'transcend_contacts';

export class ContactService {
  // 本地存储辅助函数
  private static saveContactsToLocal(contacts: ContactProfile[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(contacts));
    }
  }

  private static loadContactsFromLocal(): ContactProfile[] {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error('解析本地联系人数据失败:', error);
          return [];
        }
      }
    }
    return [];
  }
  /**
   * 获取所有联系人和 AI 代理
   */
  static async getAllContacts(): Promise<ContactProfile[]> {
    // 优先从本地读取
    const localContacts = this.loadContactsFromLocal();
    if (localContacts.length > 0) {
      console.log('📱 从本地读取联系人:', localContacts.length, '个');
    }

    if (!isSupabaseConfigured) {
      return localContacts;
    }

    try {
      // 获取所有用户
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      // 获取所有 AI 代理
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*');

      if (usersError) console.error('获取用户失败:', usersError);
      if (agentsError) console.error('获取代理失败:', agentsError);

      const contacts: ContactProfile[] = [];

      // 转换用户为 ContactProfile
      (users || []).forEach(user => {
        contacts.push({
          id: user.id,
          name: user.nickname,
          avatar: user.avatar,
          isAgent: false,
          type: 'human',
          bio: user.bio,
          fullBio: user.full_bio,
          isFriend: false
        });
      });

      // 转换代理为 ContactProfile
      (agents || []).forEach(agent => {
        contacts.push({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          isAgent: true,
          type: agent.type,
          status: agent.status,
          lv: agent.lv,
          syncRate: agent.sync_rate,
          traits: agent.traits,
          model: agent.model,
          bio: agent.bio,
          fullBio: agent.full_bio,
          isFriend: true // AI 代理默认都是好友
        });
      });

      if (contacts.length > 0) {
        // 保存到本地
        this.saveContactsToLocal(contacts);
      }

      return contacts.length > 0 ? contacts : localContacts;
    } catch (error) {
      console.error('获取联系人出错:', error);
      return localContacts;
    }
  }

  /**
   * 获取当前用户的好友列表
   */
  static async getFriends(userId: string): Promise<ContactProfile[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('获取好友失败:', error);
        return [];
      }

      const friends: ContactProfile[] = [];
      
      (friendships || []).forEach(fs => {
        const friendData = fs.friend;
        if (friendData) {
          friends.push({
            id: friendData.id,
            name: friendData.nickname,
            avatar: friendData.avatar,
            isAgent: false,
            type: 'human',
            bio: friendData.bio,
            fullBio: friendData.full_bio,
            isFriend: true
          });
        }
      });

      // 获取所有 AI 代理（它们默认都是好友）
      const { data: agents } = await supabase.from('agents').select('*');
      (agents || []).forEach(agent => {
        friends.push({
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          isAgent: true,
          type: agent.type,
          status: agent.status,
          lv: agent.lv,
          syncRate: agent.sync_rate,
          traits: agent.traits,
          model: agent.model,
          bio: agent.bio,
          fullBio: agent.full_bio,
          isFriend: true
        });
      });

      return friends;
    } catch (error) {
      console.error('获取好友列表出错:', error);
      return [];
    }
  }

  /**
   * 检查用户是否是好友
   */
  static async isFriend(userId: string, contactId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      // 检查是否是 AI 代理（默认都是好友）
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', contactId)
        .single();
      
      if (agent) return true;

      // 检查用户好友关系
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_id.eq.${contactId}),and(user_id.eq.${contactId},friend_id.eq.${userId})`)
        .eq('status', 'accepted')
        .single();

      return !!friendship;
    } catch (error) {
      return false;
    }
  }

  /**
   * 搜索联系人和代理
   */
  static async searchContacts(query: string): Promise<ContactProfile[]> {
    const allContacts = await this.getAllContacts();
    const searchLower = query.toLowerCase();
    
    return allContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.bio && contact.bio.toLowerCase().includes(searchLower))
    );
  }

  /**
   * 获取单个联系人/代理详情
   */
  static async getContactById(contactId: string): Promise<ContactProfile | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      // 先检查是否是用户
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (user) {
        return {
          id: user.id,
          name: user.nickname,
          avatar: user.avatar,
          isAgent: false,
          type: 'human',
          bio: user.bio,
          fullBio: user.full_bio,
          isFriend: false // 需要单独查询
        };
      }

      // 再检查是否是 AI 代理
      const { data: agent } = await supabase
        .from('agents')
        .select('*')
        .eq('id', contactId)
        .single();

      if (agent) {
        return {
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
          isAgent: true,
          type: agent.type,
          status: agent.status,
          lv: agent.lv,
          syncRate: agent.sync_rate,
          traits: agent.traits,
          model: agent.model,
          bio: agent.bio,
          fullBio: agent.full_bio,
          isFriend: true
        };
      }

      return null;
    } catch (error) {
      console.error('获取联系人详情出错:', error);
      return null;
    }
  }
}
