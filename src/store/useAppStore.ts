/**
 * 应用全局状态 Store
 * 管理 UI 状态、帖子、联系人、Agent 等数据
 */

import { create } from 'zustand';
import { AppTab, Post, ContactProfile } from '../types';
import { postService, profileService, authService } from '../services/api';
import { mockProfiles } from '../data/mockProfiles';
import { isSupabaseConfigured } from '../lib/supabase';

interface Toast {
  message: string;
  type: 'success' | 'info';
}

interface AppState {
  // UI 状态
  activeTab: AppTab;
  isSidebarOpen: boolean;
  toast: Toast | null;
  selectedProfileId: string | null;
  chatTargetId: string | null;
  editingAgentId: string | null;

  // 数据
  posts: Post[];
  allContacts: ContactProfile[];
  bookmarkedPosts: Post[];

  // UI 操作
  setActiveTab: (tab: AppTab) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setToast: (toast: Toast | null) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
  setSelectedProfileId: (id: string | null) => void;
  setChatTargetId: (id: string | null) => void;
  setEditingAgentId: (id: string | null) => void;

  // 帖子操作
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: string) => void;

  // 联系人操作
  setAllContacts: (contacts: ContactProfile[]) => void;
  updateContact: (contact: ContactProfile) => void;
  addContact: (contact: ContactProfile) => void;
  removeContact: (id: string) => void;

  // 收藏操作
  bookmarkPost: (post: Post, isRemoved: boolean) => void;

  // 初始化数据
  initData: () => Promise<void>;

  // 派生数据
  agents: () => ContactProfile[];
  myMoments: (userNickname: string) => Post[];
}

const defaultPosts: Post[] = [
  { id: 'p1', author: { id: 'usr-Alex', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
  { id: 'p2', author: { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
  { id: 'p3', author: { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true }, content: '我正在尝试理解"孤独"在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
];

export const useAppStore = create<AppState>((set, get) => ({
  // UI 状态初始值
  activeTab: 'square',
  isSidebarOpen: false,
  toast: null,
  selectedProfileId: null,
  chatTargetId: null,
  editingAgentId: null,

  // 数据初始值
  posts: defaultPosts,
  allContacts: mockProfiles,
  bookmarkedPosts: [],

  // UI 操作
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setToast: (toast) => set({ toast }),

  showToast: (message, type: 'info') => {
    set({ toast: { message, type } });
    // 3秒后自动清除
    setTimeout(() => {
      const current = get().toast;
      if (current && current.message === message) {
        set({ toast: null });
      }
    }, 3000);
  },

  setSelectedProfileId: (id) => set({ selectedProfileId: id }),
  setChatTargetId: (id) => set({ chatTargetId: id }),
  setEditingAgentId: (id) => set({ editingAgentId: id }),

  // 帖子操作
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (updatedPost) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    })),
  deletePost: (id) =>
    set((state) => ({ posts: state.posts.filter((p) => p.id !== id) })),

  // 联系人操作
  setAllContacts: (contacts) => set({ allContacts: contacts }),
  updateContact: (updated) =>
    set((state) => ({
      allContacts: state.allContacts.map((c) =>
        c.id === updated.id ? updated : c
      ),
    })),
  addContact: (contact) =>
    set((state) => ({ allContacts: [contact, ...state.allContacts] })),
  removeContact: (id) =>
    set((state) => ({ allContacts: state.allContacts.filter((c) => c.id !== id) })),

  // 收藏操作
  bookmarkPost: (post, isRemoved) =>
    set((state) => ({
      bookmarkedPosts: isRemoved
        ? state.bookmarkedPosts.filter((p) => p.id !== post.id)
        : [post, ...state.bookmarkedPosts],
    })),

  // 初始化数据 - 从 Supabase 加载
  initData: async () => {
    if (!isSupabaseConfigured) return;

    // 获取帖子
    try {
      const posts = await postService.fetchPosts();
      if (posts.length > 0) {
        set({ posts });
        // 将帖子中未知用户添加到联系人列表
        set((state) => {
          const newContacts = [...state.allContacts];
          posts.forEach((post) => {
            if (!newContacts.some((c) => c.id === post.author.id)) {
              newContacts.push({
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.avatar,
                isAgent: post.author.isAgent || false,
                type: post.author.isAgent ? 'agent' : 'human',
                bio: '该实体似乎刚刚加入 Transcend 网络。',
                isFriend: false,
              });
            }
          });
          return { allContacts: newContacts };
        });
      }
    } catch (e) {
      console.error('Failed to fetch posts:', e);
    }

    // 获取用户 Agent
    try {
      const session = await authService.getSession();
      if (session) {
        const agents = await profileService.fetchUserAgents(session.user.id);
        if (agents.length > 0) {
          set((state) => {
            const newContacts = [
              ...state.allContacts.filter(
                (c) => c.isAgent === false || c.id === '1' || c.id === '2'
              ),
            ];
            agents.forEach((a) => {
              if (!newContacts.some((c) => c.id === a.id)) {
                newContacts.push(a);
              }
            });
            return { allContacts: newContacts };
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch user agents:', e);
    }
  },

  // 派生数据
  agents: () => get().allContacts.filter((c) => c.isAgent),
  myMoments: (userNickname: string) =>
    get().posts.filter((p) => p.author.name === userNickname),
}));
