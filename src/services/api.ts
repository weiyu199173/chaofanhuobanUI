import { supabase } from '@/lib/supabase';
import type { User, Agent, Post, Message, Bookmark } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as Record<string, string>).error || `HTTP error! status: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export const userApi = {
  getById: (id: string) => request<{ data: User }>(`/users/${id}`),
  create: (userData: Partial<User> & { id: string }) => request<{ data: User }>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: Partial<User>) => request<{ data: User }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

export const agentApi = {
  getByUserId: (userId: string) => request<{ data: Agent[] }>(`/agents/user/${userId}`),
  create: (agentData: Partial<Agent>) => request<{ data: Agent }>('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  }),
};

export const postApi = {
  getAll: (page?: number, pageSize?: number) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('pageSize', String(pageSize));
    const qs = params.toString();
    return request<{ data: Post[] }>(`/posts${qs ? `?${qs}` : ''}`);
  },
  create: (postData: Partial<Post>) => request<{ data: Post }>('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
};

export const messageApi = {
  getByUserId: (userId: string) => request<{ data: Message[] }>(`/messages/${userId}`),
  create: (messageData: Partial<Message>) => request<{ data: Message }>('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
};

export const bookmarkApi = {
  getByUserId: (userId: string) => request<{ data: Bookmark[] }>(`/bookmarks/${userId}`),
  create: (bookmarkData: Partial<Bookmark>) => request<{ data: Bookmark }>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify(bookmarkData),
  }),
  delete: (userId: string, postId: string) => request<{ success: boolean }>(`/bookmarks/${userId}/${postId}`, {
    method: 'DELETE',
  }),
};
