import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { postApi } from '@/services/api';
import type { DisplayPost, Post } from '@/types';

// --- State ---
interface AppDataState {
  posts: DisplayPost[];
  postsLoading: boolean;
}

const initialState: AppDataState = {
  posts: [],
  postsLoading: true,
};

// --- Actions ---
type AppDataAction =
  | { type: 'SET_POSTS'; payload: DisplayPost[] }
  | { type: 'SET_POSTS_LOADING'; payload: boolean }
  | { type: 'ADD_POST'; payload: DisplayPost }
  | { type: 'TOGGLE_LIKE'; payload: string }
  | { type: 'TOGGLE_BOOKMARK'; payload: string }
  | { type: 'INCREMENT_COMMENTS'; payload: string };

function appDataReducer(state: AppDataState, action: AppDataAction): AppDataState {
  switch (action.type) {
    case 'SET_POSTS':
      return { ...state, posts: action.payload, postsLoading: false };
    case 'SET_POSTS_LOADING':
      return { ...state, postsLoading: action.payload };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'TOGGLE_LIKE':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p
        ),
      };
    case 'TOGGLE_BOOKMARK':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload ? { ...p, bookmarked: !p.bookmarked } : p
        ),
      };
    case 'INCREMENT_COMMENTS':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload ? { ...p, comments: p.comments + 1 } : p
        ),
      };
    default:
      return state;
  }
}

// --- Context ---
interface AppDataContextValue {
  state: AppDataState;
  loadPosts: () => Promise<void>;
  createPost: (content: string, authorName: string, authorAvatar: string, isAgent: boolean) => Promise<void>;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  incrementComments: (postId: string) => void;
  formatPost: (post: Post) => DisplayPost;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appDataReducer, initialState);

  const formatPost = useCallback((post: Post): DisplayPost => ({
    id: post.id,
    author: {
      name: post.author_name || '未知',
      avatar: post.author_avatar || '',
      isAgent: post.is_agent,
      agentType: post.agent_type as 'twin' | 'super' | undefined,
    },
    content: post.content,
    time: '刚刚',
    image: post.image,
    likes: post.likes,
    comments: post.comments,
  }), []);

  const loadPosts = useCallback(async () => {
    dispatch({ type: 'SET_POSTS_LOADING', payload: true });
    try {
      const response = await postApi.getAll();
      if (response.data) {
        const formattedPosts = response.data.map(formatPost);
        dispatch({ type: 'SET_POSTS', payload: formattedPosts });
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
      dispatch({ type: 'SET_POSTS_LOADING', payload: false });
    }
  }, [formatPost]);

  const createPost = useCallback(async (content: string, authorName: string, authorAvatar: string, isAgent: boolean) => {
    try {
      const response = await postApi.create({
        content,
        is_agent: isAgent,
      } as Partial<Post>);

      if (response.data) {
        const newPost: DisplayPost = {
          id: response.data.id,
          author: {
            name: response.data.author_name || authorName,
            avatar: response.data.author_avatar || authorAvatar,
            isAgent: response.data.is_agent,
            agentType: response.data.agent_type as 'twin' | 'super' | undefined,
          },
          content: response.data.content,
          time: '刚刚',
          image: response.data.image,
          likes: response.data.likes,
          comments: response.data.comments,
        };
        dispatch({ type: 'ADD_POST', payload: newPost });
      }
    } catch (error) {
      console.error('发布帖子失败:', error);
      throw error;
    }
  }, []);

  const toggleLike = useCallback((postId: string) => {
    dispatch({ type: 'TOGGLE_LIKE', payload: postId });
  }, []);

  const toggleBookmark = useCallback((postId: string) => {
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: postId });
  }, []);

  const incrementComments = useCallback((postId: string) => {
    dispatch({ type: 'INCREMENT_COMMENTS', payload: postId });
  }, []);

  return (
    <AppDataContext.Provider value={{ state, loadPosts, createPost, toggleLike, toggleBookmark, incrementComments, formatPost }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
