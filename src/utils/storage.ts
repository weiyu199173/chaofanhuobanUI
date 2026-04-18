const STORAGE_KEYS = {
  USER_PROFILE: 'transcend_user_profile',
  CONTACTS: 'transcend_contacts',
  POSTS: 'transcend_posts',
  BOOKMARKED_POSTS: 'transcend_bookmarked_posts'
};

export const Storage = {
  /**
   * 存储用户资料
   */
  saveUserProfile(profile: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('保存用户资料失败:', error);
    }
  },

  /**
   * 获取用户资料
   */
  getUserProfile(): any {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      return null;
    }
  },

  /**
   * 存储联系人
   */
  saveContacts(contacts: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (error) {
      console.error('保存联系人失败:', error);
    }
  },

  /**
   * 获取联系人
   */
  getContacts(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取联系人失败:', error);
      return [];
    }
  },

  /**
   * 存储帖子
   */
  savePosts(posts: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (error) {
      console.error('保存帖子失败:', error);
    }
  },

  /**
   * 获取帖子
   */
  getPosts(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取帖子失败:', error);
      return [];
    }
  },

  /**
   * 存储收藏的帖子
   */
  saveBookmarkedPosts(posts: any[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKED_POSTS, JSON.stringify(posts));
    } catch (error) {
      console.error('保存收藏帖子失败:', error);
    }
  },

  /**
   * 获取收藏的帖子
   */
  getBookmarkedPosts(): any[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKED_POSTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取收藏帖子失败:', error);
      return [];
    }
  },

  /**
   * 清除所有数据（登出时使用）
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清除数据失败:', error);
    }
  }
};
