import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DigitalTwin } from '../types';

const LOCAL_STORAGE_KEY = 'transcend_digital_twins';

export class DigitalTwinService {
  private static saveToLocal(twins: DigitalTwin[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(twins));
    }
  }

  private static loadFromLocal(): DigitalTwin[] {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    }
    return [];
  }

  private static saveSingleToLocal(twin: DigitalTwin) {
    const twins = this.loadFromLocal();
    const index = twins.findIndex(t => t.id === twin.id);
    if (index >= 0) {
      twins[index] = twin;
    } else {
      twins.push(twin);
    }
    this.saveToLocal(twins);
  }

  static async createDigitalTwin(
    userId: string,
    name: string,
    avatar: string,
    bio: string,
    personalitySignature: string
  ): Promise<DigitalTwin | null> {
    const newTwin: DigitalTwin = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      avatar,
      bio,
      personality_signature: personalitySignature,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    };

    this.saveSingleToLocal(newTwin);
    console.log('💾 数字孪生已保存到本地:', newTwin);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器保存');
      return newTwin;
    }

    try {
      console.log('🔄 正在同步到服务器...');
      
      const { data, error } = await supabase
        .from('digital_twins')
        .insert(newTwin)
        .select()
        .single();

      if (error) {
        console.error('❌ 数据库操作失败:', error);
        return newTwin;
      }

      if (data) {
        this.saveSingleToLocal(data);
        console.log('✅ 数字孪生已同步到服务器！');
        return data;
      }

      return newTwin;
    } catch (error) {
      console.error('💥 同步到服务器异常:', error);
      return newTwin;
    }
  }

  static async getDigitalTwinsByUser(userId: string): Promise<DigitalTwin[]> {
    const localTwins = this.loadFromLocal().filter(t => t.user_id === userId);
    if (localTwins.length > 0) {
      console.log('📱 从本地读取数字孪生列表:', localTwins);
    }

    if (!isSupabaseConfigured) {
      return localTwins;
    }

    try {
      const { data, error } = await supabase
        .from('digital_twins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取数字孪生列表失败:', error);
        return localTwins;
      }

      if (data && data.length > 0) {
        this.saveToLocal(data);
        return data;
      }

      return localTwins;
    } catch (error) {
      console.error('获取数字孪生列表出错:', error);
      return localTwins;
    }
  }

  static async getDigitalTwinById(twinId: string): Promise<DigitalTwin | null> {
    const localTwins = this.loadFromLocal();
    const localTwin = localTwins.find(t => t.id === twinId);
    if (localTwin) {
      console.log('📱 从本地读取数字孪生:', localTwin);
    }

    if (!isSupabaseConfigured) {
      return localTwin || null;
    }

    try {
      const { data, error } = await supabase
        .from('digital_twins')
        .select('*')
        .eq('id', twinId)
        .single();

      if (error) {
        console.error('获取数字孪生失败:', error);
        return localTwin || null;
      }

      if (data) {
        this.saveSingleToLocal(data);
        return data;
      }

      return localTwin || null;
    } catch (error) {
      console.error('获取数字孪生出错:', error);
      return localTwin || null;
    }
  }

  static async updateDigitalTwin(
    twinId: string,
    updates: Partial<Pick<DigitalTwin, 'name' | 'avatar' | 'bio' | 'personality_signature'>>
  ): Promise<boolean> {
    const localTwins = this.loadFromLocal();
    const existingTwin = localTwins.find(t => t.id === twinId);
    
    if (!existingTwin) {
      console.error('❌ 未找到数字孪生');
      return false;
    }

    const updatedTwin: DigitalTwin = {
      ...existingTwin,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.saveSingleToLocal(updatedTwin);
    console.log('💾 数字孪生已更新到本地:', updatedTwin);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器更新');
      return true;
    }

    try {
      console.log('🔄 正在同步更新到服务器...');
      
      const { error } = await supabase
        .from('digital_twins')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', twinId);

      if (error) {
        console.error('❌ 数据库更新失败:', error);
        return true;
      }

      console.log('✅ 数字孪生已同步到服务器！');
      return true;
    } catch (error) {
      console.error('💥 同步更新到服务器异常:', error);
      return true;
    }
  }

  static async deactivateDigitalTwin(twinId: string): Promise<boolean> {
    const localTwins = this.loadFromLocal();
    const existingTwin = localTwins.find(t => t.id === twinId);
    
    if (!existingTwin) {
      console.error('❌ 未找到数字孪生');
      return false;
    }

    const deactivatedTwin: DigitalTwin = {
      ...existingTwin,
      is_active: false,
      updated_at: new Date().toISOString(),
    };

    this.saveSingleToLocal(deactivatedTwin);
    console.log('💾 数字孪生已停用并保存到本地:', deactivatedTwin);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器更新');
      return true;
    }

    try {
      console.log('🔄 正在同步停用状态到服务器...');
      
      const { error } = await supabase
        .from('digital_twins')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', twinId);

      if (error) {
        console.error('❌ 数据库更新失败:', error);
        return true;
      }

      console.log('✅ 数字孪生停用状态已同步到服务器！');
      return true;
    } catch (error) {
      console.error('💥 同步停用状态到服务器异常:', error);
      return true;
    }
  }
}
