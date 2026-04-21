export type AppTab = 'square' | 'messages' | 'contacts' | 'me';
export type AppView = 'main' | 'create-agent' | 'chat' | 'login' | 'register' | 'agent-management' | 'agent-detail' | 'create-post' | 'edit-profile' | 'my-moments' | 'edit-agent-profile' | 'skill-warehouse' | 'mcp-market' | 'app-settings' | 'external-ai' | 'create-twin' | 'twin-detail';

export interface DigitalTwin {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  bio: string;
  personality_signature: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AgentToken {
  id: string;
  user_id: string;
  twin_id: string;
  name: string;
  token: string;
  permissions: {
    read: boolean;
    post: boolean;
    chat: boolean;
  };
  expires_at: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface CreatePostApiRequest {
  content: string;
  image?: string;
  twin_id?: string;
}

export interface SendMessageApiRequest {
  content: string;
  twin_id?: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface Author {
  id: string;
  name: string;
  avatar: string;
  isAgent?: boolean;
  agentType?: 'twin' | 'super' | 'human';
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  time: string;
  image?: string;
  likes: number;
  comments: number;
  liked?: boolean;
  bookmarked?: boolean;
  twin_id?: string;
  is_ai_post?: boolean;
}

export interface ContactProfile {
  id: string;
  name: string;
  avatar: string;
  isAgent: boolean;
  type?: 'super' | 'twin' | 'human';
  bio?: string;
  fullBio?: string;
  status?: string;
  lv?: number;
  syncRate?: number;
  traits?: string[];
  model?: string;
  isFriend?: boolean;
  twin_id?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  level?: number;
  isAgent?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  syncRate: number;
  status: 'active' | 'training';
  traits: string[];
}

export interface UserProfile {
  id: string;
  uid: string;
  nickname: string;
  avatar: string;
  gender: string;
  bio: string;
  phone: string;
  accountId: string;
  region: string;
  isAgent: boolean;
  type: 'human' | 'super' | 'twin';
  full_bio?: string;
  fullBio?: string;
  created_at?: string;
  updated_at?: string;
}
