import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Author } from '../types';

export interface DBPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  author_data: Author;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export class PostService {
  /**
   * 获取所有帖子
   */
  static async getAllPosts(): Promise<Post[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取帖子失败:', error);
        return [];
      }

      return (data || []).map(this.transformDBPostToPost);
    } catch (error) {
      console.error('获取帖子出错:', error);
      return [];
    }
  }

  /**
   * 创建新帖子
   */
  static async createPost(postData: {
    content: string;
    image_url?: string;
    author_data: Author;
  }): Promise<Post | null> {
    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          image_url: postData.image_url,
          author_data: postData.author_data,
          likes_count: 0,
          comments_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('创建帖子失败:', error);
        return null;
      }

      return this.transformDBPostToPost(data);
    } catch (error) {
      console.error('创建帖子出错:', error);
      return null;
    }
  }

  /**
   * 更新帖子
   */
  static async updatePost(postId: string, updates: Partial<{ content: string; image_url: string }>): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        console.error('更新帖子失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('更新帖子出错:', error);
      return false;
    }
  }

  /**
   * 删除帖子
   */
  static async deletePost(postId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('删除帖子失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除帖子出错:', error);
      return false;
    }
  }

  /**
   * 点赞/取消点赞帖子
   */
  static async toggleLike(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      // 先检查是否已经点赞
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // 取消点赞
        await supabase.from('likes').delete().eq('id', existingLike.id);
        // 减少点赞数
        await supabase.rpc('decrement_likes_count', { post_id: postId });
      } else {
        // 添加点赞
        await supabase.from('likes').insert({ post_id: postId, user_id: userId });
        // 增加点赞数
        await supabase.rpc('increment_likes_count', { post_id: postId });
      }

      return true;
    } catch (error) {
      console.error('切换点赞状态出错:', error);
      return false;
    }
  }

  /**
   * 收藏/取消收藏帖子
   */
  static async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      return false;
    }

    try {
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingBookmark) {
        await supabase.from('bookmarks').delete().eq('id', existingBookmark.id);
      } else {
        await supabase.from('bookmarks').insert({ post_id: postId, user_id: userId });
      }

      return true;
    } catch (error) {
      console.error('切换收藏状态出错:', error);
      return false;
    }
  }

  /**
   * 获取用户收藏的帖子
   */
  static async getBookmarkedPosts(userId: string): Promise<Post[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          post:posts(*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('获取收藏帖子失败:', error);
        return [];
      }

      return (data || []).map((item: any) => this.transformDBPostToPost(item.post));
    } catch (error) {
      console.error('获取收藏帖子出错:', error);
      return [];
    }
  }

  /**
   * 获取用户发布的帖子
   */
  static async getUserPosts(userId: string): Promise<Post[]> {
    if (!isSupabaseConfigured) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取用户帖子失败:', error);
        return [];
      }

      return (data || []).map(this.transformDBPostToPost);
    } catch (error) {
      console.error('获取用户帖子出错:', error);
      return [];
    }
  }

  /**
   * 将数据库帖子转换为应用帖子类型
   */
  private static transformDBPostToPost(dbPost: DBPost): Post {
    return {
      id: dbPost.id,
      author: dbPost.author_data,
      content: dbPost.content,
      time: this.formatTime(dbPost.created_at),
      image: dbPost.image_url,
      likes: dbPost.likes_count,
      comments: dbPost.comments_count,
      liked: false, // 这个需要单独查询
      bookmarked: false // 这个需要单独查询
    };
  }

  /**
   * 格式化时间显示
   */
  private static formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  /**
   * 订阅帖子实时更新
   */
  static subscribeToPosts(callback: (posts: Post[]) => void) {
    if (!isSupabaseConfigured) return () => {};

    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
        const posts = await this.getAllPosts();
        callback(posts);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}
