// API服务层，用于与后端API通信

const API_BASE_URL = 'http://localhost:3001/api';

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 用户相关API
export const userApi = {
  getById: (id: string) => request<{ data: any }>(`/users/${id}`),
  create: (userData: any) => request<{ data: any }>('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id: string, userData: any) => request<{ data: any }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// 代理相关API
export const agentApi = {
  getByUserId: (userId: string) => request<{ data: any[] }>(`/agents/user/${userId}`),
  create: (agentData: any) => request<{ data: any }>('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  }),
};

// 帖子相关API
export const postApi = {
  getAll: () => request<{ data: any[] }>('/posts'),
  create: (postData: any) => request<{ data: any }>('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  }),
};

// 消息相关API
export const messageApi = {
  getByUserId: (userId: string) => request<{ data: any[] }>(`/messages/${userId}`),
  create: (messageData: any) => request<{ data: any }>('/messages', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
};

// 收藏相关API
export const bookmarkApi = {
  getByUserId: (userId: string) => request<{ data: any[] }>(`/bookmarks/${userId}`),
  create: (bookmarkData: any) => request<{ data: any }>('/bookmarks', {
    method: 'POST',
    body: JSON.stringify(bookmarkData),
  }),
  delete: (userId: string, postId: string) => request<{ success: boolean }>(`/bookmarks/${userId}/${postId}`, {
    method: 'DELETE',
  }),
};
