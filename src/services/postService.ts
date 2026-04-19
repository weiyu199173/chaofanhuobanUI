import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Author } from '../types';

const LOCAL_STORAGE_KEY = 'transcend_posts';

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
  // 本地存储辅助函数
  private static savePostsToLocal(posts: Post[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
    }
  }

  private static loadPostsFromLocal(): Post[] {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error('解析本地帖子数据失败:', error);
          return [];
        }
      }
    }
    return [];
  }

  private static addPostToLocal(post: Post): void {
    const posts = this.loadPostsFromLocal();
    const existingIndex = posts.findIndex(p => p.id === post.id);
    if (existingIndex >= 0) {
      posts[existingIndex] = post;
    } else {
      posts.unshift(post); // 新帖子添加到开头
    }
    this.savePostsToLocal(posts);
  }

  private static removePostFromLocal(postId: string): void {
    const posts = this.loadPostsFromLocal();
    const filteredPosts = posts.filter(p => p.id !== postId);
    this.savePostsToLocal(filteredPosts);
  }
  /**
   * 获取所有帖子
   */
  static async getAllPosts(): Promise<Post[]> {
    // 优先从本地读取
    const localPosts = this.loadPostsFromLocal();
    if (localPosts.length > 0) {
      console.log('📱 从本地读取帖子:', localPosts.length, '个');
    }

    if (!isSupabaseConfigured) {
      return localPosts;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取帖子失败:', error);
        return localPosts; // 数据库失败时返回本地数据
      }

      if (data && data.length > 0) {
        const posts = data.map(this.transformDBPostToPost);
        // 保存到本地
        this.savePostsToLocal(posts);
        return posts;
      }

      return localPosts; // 数据库没有时返回本地数据
    } catch (error) {
      console.error('获取帖子出错:', error);
      return localPosts; // 出错时返回本地数据
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 创建本地帖子对象
      const newPost: Post = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author: postData.author_data,
        content: postData.content,
        time: '刚刚',
        image: postData.image_url,
        likes: 0,
        comments: 0,
        liked: false,
        bookmarked: false
      };

      // 立即保存到本地
      this.addPostToLocal(newPost);
      console.log('💾 帖子已保存到本地:', newPost);

      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase 未配置，跳过服务器保存');
        return newPost;
      }

      try {
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
          // 数据库失败时，仍然返回本地创建的帖子
          return newPost;
        }

        const dbPost = this.transformDBPostToPost(data);
        // 更新本地存储中的帖子（使用数据库返回的真实 ID）
        this.addPostToLocal(dbPost);
        console.log('✅ 帖子已同步到服务器！');
        return dbPost;
      } catch (error) {
        console.error('创建帖子出错:', error);
        // 出错时，返回本地创建的帖子
        return newPost;
      }
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
    // 立即从本地删除
    this.removePostFromLocal(postId);
    console.log('💾 帖子已从本地删除:', postId);

    if (!isSupabaseConfigured) {
      console.log('⚠️ Supabase 未配置，跳过服务器删除');
      return true;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('删除帖子失败:', error);
        // 数据库失败时，仍然返回 true，因为本地已经删除了
        return true;
      }

      console.log('✅ 帖子已从服务器删除！');
      return true;
    } catch (error) {
      console.error('删除帖子出错:', error);
      // 出错时，仍然返回 true，因为本地已经删除了
      return true;
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

    let channel: any = null;
    
    try {
      channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async () => {
          const posts = await this.getAllPosts();
          callback(posts);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ 实时订阅已连接');
          } else if (status === 'CHANNEL_ERROR') {
            console.log('ℹ️ 实时订阅不可用（可能未在 Supabase 开启）');
          }
        });
    } catch (error) {
      console.log('ℹ️ 实时功能未启用，应用将正常使用轮询方式');
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }
}
