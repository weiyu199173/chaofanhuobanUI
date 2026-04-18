export type AppTab = 'square' | 'messages' | 'contacts' | 'me';
export type AppView = 'main' | 'create-agent' | 'chat' | 'login' | 'register' | 'agent-management' | 'agent-detail' | 'create-post' | 'edit-profile' | 'my-moments' | 'edit-agent-profile' | 'skill-warehouse' | 'mcp-market' | 'app-settings';

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
