/**
 * 认证状态 Store
 * 管理用户登录状态、用户信息
 */

import { create } from 'zustand';
import { authService } from '../services/api';

interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  gender: string;
  bio: string;
  phone: string;
  accountId: string;
  region: string;
  isAgent: boolean;
}

interface AuthState {
  isLoggedIn: boolean;
  userProfile: UserProfile;
  login: (user: any) => void;
  logout: () => Promise<void>;
  register: (user: any) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  initAuth: () => () => void;
}

const defaultUserProfile: UserProfile = {
  id: 'me',
  nickname: 'Alex Chen',
  avatar: 'https://picsum.photos/seed/profile/200/200',
  gender: '男',
  bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
  phone: '138 8888 0000',
  accountId: 'Transcend#001',
  region: '上海，静安',
  isAgent: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  userProfile: { ...defaultUserProfile },

  login: (user: any) => {
    const nickname = user.user_metadata?.nickname;
    set((state) => ({
      isLoggedIn: true,
      userProfile: nickname
        ? { ...state.userProfile, nickname }
        : state.userProfile,
    }));
  },

  logout: async () => {
    await authService.logout();
    set({ isLoggedIn: false, userProfile: { ...defaultUserProfile } });
  },

  register: (user: any) => {
    const nickname = user.user_metadata?.nickname;
    set((state) => ({
      isLoggedIn: true,
      userProfile: nickname
        ? { ...state.userProfile, nickname }
        : state.userProfile,
    }));
  },

  updateUserProfile: (data: Partial<UserProfile>) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...data },
    }));
  },

  initAuth: (): (() => void) => {
    // 检查现有 session
    authService.getSession().then((session) => {
      if (session) {
        const nickname = session.user.user_metadata?.nickname;
        set((state) => ({
          isLoggedIn: true,
          userProfile: nickname
            ? { ...state.userProfile, nickname }
            : state.userProfile,
        }));
      }
    });

    // 监听认证状态变化
    const { unsubscribe } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const nickname = session.user.user_metadata?.nickname;
        set((state) => ({
          isLoggedIn: true,
          userProfile: nickname
            ? { ...state.userProfile, nickname }
            : state.userProfile,
        }));
      } else if (event === 'INITIAL_SESSION' && session) {
        const nickname = session.user.user_metadata?.nickname;
        set((state) => ({
          isLoggedIn: true,
          userProfile: nickname
            ? { ...state.userProfile, nickname }
            : state.userProfile,
        }));
      } else if (event === 'SIGNED_OUT') {
        set({ isLoggedIn: false, userProfile: { ...defaultUserProfile } });
      }
    });

    return unsubscribe;
  },
}));
