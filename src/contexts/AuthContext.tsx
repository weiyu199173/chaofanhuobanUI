import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { userApi, agentApi, bookmarkApi } from '@/services/api';
import type { UserProfile, DisplayAgent, DisplayPost } from '@/types';

// --- State ---
interface AuthState {
  supabaseUser: { id: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile;
  agents: DisplayAgent[];
  bookmarkedPosts: DisplayPost[];
}

const defaultProfile: UserProfile = {
  nickname: 'Alex Chen',
  avatar: 'https://picsum.photos/seed/profile/200/200',
  gender: '男',
  bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
  phone: '138 8888 0000',
  accountId: 'Transcend#001',
  region: '上海，静安',
};

const defaultAgents: DisplayAgent[] = [
  { id: 'a1', name: 'Nexus AI', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', avatar: 'https://picsum.photos/seed/nexus/100/100', syncRate: 98, status: 'active', traits: ['高效', '专业'] },
  { id: 'a2', name: 'Aura', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', avatar: 'https://picsum.photos/seed/aura/100/100', syncRate: 99.8, status: 'active', traits: ['温文尔雅'] },
];

const initialState: AuthState = {
  supabaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  userProfile: defaultProfile,
  agents: defaultAgents,
  bookmarkedPosts: [],
};

// --- Actions ---
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: { userId: string } }
  | { type: 'AUTH_SIGNOUT' }
  | { type: 'SET_USER_PROFILE'; payload: UserProfile }
  | { type: 'SET_AGENTS'; payload: DisplayAgent[] }
  | { type: 'SET_BOOKMARKED_POSTS'; payload: DisplayPost[] }
  | { type: 'ADD_BOOKMARKED_POST'; payload: DisplayPost }
  | { type: 'REMOVE_BOOKMARKED_POST'; payload: string }
  | { type: 'UPDATE_AGENT'; payload: DisplayAgent }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'AUTH_SUCCESS':
      return { ...state, supabaseUser: { id: action.payload.userId }, isAuthenticated: true, isLoading: false };
    case 'AUTH_SIGNOUT':
      return { ...initialState, isLoading: false };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    case 'SET_BOOKMARKED_POSTS':
      return { ...state, bookmarkedPosts: action.payload };
    case 'ADD_BOOKMARKED_POST':
      return { ...state, bookmarkedPosts: [action.payload, ...state.bookmarkedPosts] };
    case 'REMOVE_BOOKMARKED_POST':
      return { ...state, bookmarkedPosts: state.bookmarkedPosts.filter(p => p.id !== action.payload) };
    case 'UPDATE_AGENT':
      return { ...state, agents: state.agents.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'UPDATE_PROFILE':
      return { ...state, userProfile: action.payload };
    default:
      return state;
  }
}

// --- Context ---
interface AuthContextValue {
  state: AuthState;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'info') => void;
  toast: { message: string; type: 'success' | 'info' } | null;
  fetchUserData: (userId: string) => Promise<void>;
  syncBookmark: (post: DisplayPost, isRemoved: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: { userId: session.user.id } });
      } else {
        dispatch({ type: 'AUTH_SIGNOUT' });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const userResponse = await userApi.getById(userId);
      if (userResponse.data) {
        const d = userResponse.data;
        dispatch({
          type: 'SET_USER_PROFILE',
          payload: {
            nickname: d.nickname,
            avatar: d.avatar || defaultProfile.avatar,
            gender: d.gender || '',
            bio: d.bio || '',
            phone: d.phone || '',
            accountId: d.account_id,
            region: d.region || '',
          },
        });
      }

      const agentsResponse = await agentApi.getByUserId(userId);
      if (agentsResponse.data && agentsResponse.data.length > 0) {
        dispatch({
          type: 'SET_AGENTS',
          payload: agentsResponse.data.map(a => ({
            id: a.id,
            name: a.name,
            avatar: a.avatar || '',
            syncRate: a.sync_rate,
            status: a.status as 'active' | 'training',
            traits: a.traits || [],
            bio: a.bio,
          })),
        });
      }

      const bookmarksResponse = await bookmarkApi.getByUserId(userId);
      if (bookmarksResponse.data) {
        dispatch({
          type: 'SET_BOOKMARKED_POSTS',
          payload: bookmarksResponse.data.map(b => ({
            id: b.post_id,
            author: { name: '', avatar: '' },
            content: '',
            time: '',
            likes: 0,
            comments: 0,
            bookmarked: true,
          })),
        });
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });

      if (error) {
        showToast('登录失败: ' + error.message, 'info');
        return;
      }

      showToast('登录成功', 'success');
      await fetchUserData(data.user.id);
    } catch {
      showToast('登录失败: 网络错误', 'info');
    }
  }, [showToast, fetchUserData]);

  const register = useCallback(async (phone: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        phone,
        password,
      });

      if (error) {
        showToast('注册失败: ' + error.message, 'info');
        return;
      }

      showToast('注册成功', 'success');

      if (data.user) {
        try {
          const userData = {
            id: data.user.id,
            phone: data.user.phone || '',
            nickname: '用户' + data.user.id.substring(0, 6),
            avatar: `https://picsum.photos/seed/${data.user.id}/200/200`,
            bio: '欢迎加入TranscendPartner',
            account_id: 'Transcend#' + data.user.id.substring(0, 6),
          };
          await userApi.create(userData);
          dispatch({
            type: 'SET_USER_PROFILE',
            payload: {
              nickname: userData.nickname,
              avatar: userData.avatar,
              gender: '',
              bio: userData.bio,
              phone: userData.phone,
              accountId: userData.account_id,
              region: '',
            },
          });
        } catch (error) {
          console.error('创建用户profile失败:', error);
        }
      }
    } catch {
      showToast('注册失败: 网络错误', 'info');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      showToast('登出成功', 'success');
    } catch {
      showToast('登出失败: 网络错误', 'info');
    }
  }, [showToast]);

  const syncBookmark = useCallback(async (post: DisplayPost, isRemoved: boolean) => {
    if (!state.supabaseUser) return;

    try {
      if (isRemoved) {
        await bookmarkApi.delete(state.supabaseUser.id, post.id);
        dispatch({ type: 'REMOVE_BOOKMARKED_POST', payload: post.id });
      } else {
        await bookmarkApi.create({
          user_id: state.supabaseUser.id,
          post_id: post.id,
        });
        dispatch({ type: 'ADD_BOOKMARKED_POST', payload: post });
      }
    } catch (error) {
      console.error('同步收藏失败:', error);
      showToast('收藏同步失败', 'info');
    }
  }, [state.supabaseUser, showToast]);

  return (
    <AuthContext.Provider value={{ state, login, register, logout, showToast, toast, fetchUserData, syncBookmark }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
