export interface User {
  id: string;
  phone?: string;
  email?: string;
  nickname: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  region?: string;
  account_id: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  avatar?: string;
  bio?: string;
  sync_rate: number;
  status: string;
  type: string;
  traits?: string[];
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  is_agent: boolean;
  agent_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

// --- UI-local types (not stored in DB) ---

export interface DisplayPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    isAgent?: boolean;
    agentType?: 'twin' | 'super';
  };
  content: string;
  time: string;
  image?: string;
  likes: number;
  comments: number;
  liked?: boolean;
  bookmarked?: boolean;
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

export interface DisplayAgent {
  id: string;
  name: string;
  avatar: string;
  syncRate: number;
  status: 'active' | 'training';
  traits: string[];
  bio?: string;
  linkedHuman?: {
    name: string;
    avatar: string;
  };
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  gender: string;
  bio: string;
  phone: string;
  accountId: string;
  region: string;
}

export type AppTab = 'square' | 'messages' | 'contacts' | 'me';
export type AppView = 'login' | 'register' | 'main' | 'createAgent' | 'chat' | 'agentDetail' | 'editProfile' | 'myMoments' | 'skillWarehouse' | 'mcpMarket' | 'settings' | 'sideNav' | 'editAgentProfile';
