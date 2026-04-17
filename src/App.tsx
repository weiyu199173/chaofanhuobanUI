/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, ReactNode, MouseEvent } from 'react';
import { 
  Compass, 
  MessageCircle, 
  Users, 
  User, 
  Settings, 
  Search, 
  Menu, 
  Plus, 
  ArrowLeft, 
  Info, 
  Heart, 
  Bolt, 
  MoreVertical, 
  Send,
  Image as ImageIcon,
  FileText as FileIcon,
  Video,
  Verified,
  Shield,
  Sparkles,
  Bookmark,
  Brain,
  Cpu,
  Smile,
  CheckCircle,
  Database,
  ChevronDown,
  Eye,
  EyeOff,
  Mic,
  RotateCw,
  PlusCircle,
  Smartphone,
  Lock,
  Share,
  ChevronRight,
  Music,
  UserCog,
  Phone,
  X,
  Globe,
  Star,
  LogOut,
  Layout,
  ExternalLink,
  Target,
  Command,
  PlusSquare,
  Bell,
  Clock,
  QrCode,
  MapPin,
  Camera,
  ChevronLeft,
  ShoppingBag,
  Zap,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { LaserButton, TiltedCard } from './components/Common';

// --- Types ---
type AppTab = 'square' | 'messages' | 'contacts' | 'me';
type AppView = 'main' | 'create-agent' | 'chat' | 'login' | 'register' | 'agent-management' | 'agent-detail' | 'create-post' | 'edit-profile' | 'my-moments' | 'edit-agent-profile' | 'skill-warehouse' | 'mcp-market' | 'app-settings';

interface Post {
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

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  level?: number;
  isAgent?: boolean;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  syncRate: number;
  status: 'active' | 'training';
  traits: string[];
}

// --- Icons Replacement (using Lucide) ---
// Note: Material Symbols were in the original HTML, but Lucide is required.
// I'll map them as close as possible.

// --- Components ---

const DynamicSearchBar = ({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}: { 
  placeholder: string; 
  value: string; 
  onChange: (val: string) => void;
  className?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isFocused ? '100%' : '100%',
        boxShadow: isFocused ? '0 0 15px rgba(29, 155, 240, 0.2)' : '0 0 0px rgba(0,0,0,0)',
      }}
      className={`relative flex items-center bg-surface-container-high/40 backdrop-blur-md rounded-2xl border transition-all duration-300 px-4 py-2 ${
        isFocused ? 'border-transparent bg-surface-container-high/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'border-white/5 bg-surface-container-high/20'
      } ${className}`}
    >
      <motion.div
        animate={{ 
          rotate: isFocused ? 90 : 0,
          scale: isFocused ? 1.1 : 1,
          color: isFocused ? 'var(--color-primary)' : 'var(--color-outline)'
        }}
        className="mr-3"
      >
        <Search size={18} />
      </motion.div>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border-none focus:ring-0 p-0 text-sm text-on-surface w-full placeholder:text-outline/40 transition-all font-medium"
      />
      <AnimatePresence>
        {value && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
            onClick={() => onChange('')}
            className="ml-2 text-outline hover:text-primary transition-colors p-1"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Animated underline focus effect */}
      <motion.div 
        initial={false}
        animate={{ 
          scaleX: isFocused ? 1 : 0,
          opacity: isFocused ? 1 : 0
        }}
        className="absolute bottom-0 left-4 right-4 h-[1px] bg-linear-to-r from-transparent via-primary/50 to-transparent origin-center"
      />
    </motion.div>
  );
};

const BottomNavBar = ({ activeTab, onTabChange }: { activeTab: AppTab, onTabChange: (tab: AppTab) => void }) => {
  const tabs: { id: AppTab; label: string; icon: any }[] = [
    { id: 'square', label: '广场', icon: Compass },
    { id: 'messages', label: '消息', icon: MessageCircle },
    { id: 'contacts', label: '通讯录', icon: Users },
    { id: 'me', label: '我', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-4 bg-background/80 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.4)] border-t border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-110 ${
            activeTab === tab.id ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
          }`}
        >
          <tab.icon size={24} className={activeTab === tab.id ? 'fill-primary/20' : ''} />
          <span className="text-[10px] uppercase tracking-[0.05em] font-semibold mt-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

// --- Components ---

const SideNavigation = ({ isOpen, onClose, onLogout, onNavigate, onTabChange, userProfile }: { isOpen: boolean, onClose: () => void, onLogout: () => void, onNavigate: (view: AppView) => void, onTabChange: (tab: AppTab) => void, userProfile: any }) => {
  const menuItems: { icon: any, label: string, count?: string, action?: () => void, view?: AppView }[] = [
    { icon: Globe, label: '人机广场', count: '128', action: () => {
      onTabChange('square');
      onNavigate('main');
    }},
    { icon: Compass, label: '技能仓库', count: 'New', view: 'skill-warehouse' },
    { icon: Star, label: 'MCP 市场', count: 'VIP', view: 'mcp-market' },
    { icon: Settings, label: '系统设置', view: 'app-settings' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] cursor-pointer"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-surface flex flex-col z-[201] border-r border-white/5 shadow-2xl overflow-hidden shadow-primary/10"
          >
            <div className="laser-sweep-overlay opacity-30 pointer-events-none" />
            
            <header className="p-8 pt-12 pb-14 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Layout size={28} />
                </div>
                <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-on-surface">Transcend</h2>
              </div>
              <div className="p-6 rounded-3xl bg-surface-container-low border border-white/5 flex flex-col gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -translate-y-12 translate-x-12" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="relative">
                    <img src={userProfile.avatar} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/20" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-surface-container-low flex items-center justify-center">
                       <Shield size={10} className="text-background" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg truncate tracking-tight">{userProfile.nickname}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[9px] text-primary uppercase tracking-widest font-black leading-none bg-primary/10 px-1.5 py-0.5 rounded border border-primary/10">高级架构师</p>
                      <span className="text-[9px] text-outline font-bold uppercase tracking-widest">ID: {userProfile.accountId.split('#')[1]}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                   <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[8px] uppercase font-bold text-outline tracking-widest mb-0.5">GUARD CREDIT</p>
                      <p className="font-mono text-xs font-bold text-primary">LV.4 4890</p>
                   </div>
                   <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[8px] uppercase font-bold text-outline tracking-widest mb-0.5">AGENT SYNC</p>
                      <p className="font-mono text-xs font-bold text-primary">98.2%</p>
                   </div>
                </div>
              </div>
            </header>

            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item, i) => (
                <LaserButton 
                  key={item.label}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.view) {
                      onNavigate(item.view);
                    }
                    onClose();
                  }}
                  className="w-full h-14 rounded-xl flex items-center justify-between px-6 hover:bg-white/5 transition-all text-outline hover:text-on-surface"
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className={item.icon === LogOut ? 'text-error' : ''} />
                    <span className={`font-bold text-sm tracking-wide ${item.icon === LogOut ? 'text-error' : ''}`}>{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-bold">{item.count}</span>
                  )}
                </LaserButton>
              ))}
            </nav>

            <footer className="p-8 border-t border-white/5 space-y-6">
              <LaserButton 
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full h-12 rounded-xl flex items-center gap-4 px-6 hover:bg-error/10 transition-all text-error group"
              >
                <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                <span className="font-bold text-sm tracking-widest uppercase">退出登录</span>
              </LaserButton>

              <div className="flex items-center justify-between text-outline text-[10px] font-bold uppercase tracking-widest">
                <span>Transcend Ecosystem</span>
                <span>v4.2.0</span>
              </div>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DiscoveryScreen = ({ onAction, onProfileClick, onBookmarkSync, onMenuOpen, posts, setPosts, userProfile, isSupabaseConfigured }: { 
  onAction: (msg: string, type?: 'success' | 'info') => void,
  onProfileClick: (id: string) => void,
  onBookmarkSync: (post: Post, isRemoved: boolean) => void,
  onMenuOpen: () => void,
  posts: Post[],
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
  userProfile: any,
  isSupabaseConfigured: boolean
}) => {
  const [activeFeed, setActiveFeed] = useState<'carbon' | 'silicon'>('carbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = posts.filter(post => {
    const matchesFeed = activeFeed === 'carbon' ? !post.author.isAgent : post.author.isAgent;
    const matchesSearch = post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeed && matchesSearch;
  });

  const handleImageUpload = async (file: File) => {
    if (!isSupabaseConfigured) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;

    setIsUploading(true);
    const user = (await supabase.auth.getUser()).data.user;
    
    let uploadedImageUrl = null;
    if (selectedImage) {
      uploadedImageUrl = await handleImageUpload(selectedImage);
    }

    const postData = {
      author_data: {
        name: userProfile.nickname,
        avatar: userProfile.avatar,
        isAgent: false
      },
      content: newPostContent,
      image_url: uploadedImageUrl,
      user_id: user?.id
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) throw new Error('网络响应异常');

      // Note: Real-time will handle the state update if it works, 
      // but we update locally for immediate feedback if backend returns
      const item = await response.json();
      if (item) {
        // Only update if not already handled by real-time to avoid duplicates
        setPosts(prev => {
          if (prev.find(p => p.id === item.id)) return prev;
          const newPost: Post = {
            id: item.id,
            author: item.author_data,
            content: item.content,
            time: '刚刚',
            likes: 0,
            comments: 0,
            image: item.image_url
          };
          return [newPost, ...prev];
        });

        // --- Trigger AI Auto-reply ---
        if (isSupabaseConfigured) {
          setTimeout(async () => {
            try {
              const prompt = `你是一位高维数字生命，名叫 Nova_Prime。
              现在你的碳基伙伴发布了一条动态：“${newPostContent}”。
              请以 Nova_Prime 的语气发表一条简短（20字以内）、富有哲理、带有科幻感的回帖。
              避免使用过于生硬的词汇。`;
              
              const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
              });

              const replyText = response.text?.trim() || "维度协调中...";

              await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  post_id: item.id,
                  author_data: {
                    name: 'Nova_Prime',
                    avatar: 'https://picsum.photos/seed/nova/100/100',
                    isAgent: true,
                    agentType: 'super'
                  },
                  content: replyText,
                  user_id: null
                })
              });
            } catch (e) { console.error('AI Auto-reply failed', e); }
          }, 3000);
        }
      }
    } catch (error: any) {
      if (!isSupabaseConfigured) {
        const newPost: Post = {
          id: Date.now().toString(),
          author: {
            name: userProfile.nickname,
            avatar: userProfile.avatar,
            isAgent: false
          },
          content: newPostContent,
          time: '刚刚',
          likes: 0,
          comments: 0
        };
        setPosts([newPost, ...posts]);
      } else {
        onAction('发布失败: ' + error.message, 'info');
      }
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }

    setNewPostContent('');
    if (activeFeed === 'silicon') setActiveFeed('carbon');
  };

  const handlePostAction = async (id: string, action: 'like' | 'comment' | 'bookmark' | 'share') => {
    const post = posts.find(p => p.id === id);
    if (!post) return;

    switch (action) {
      case 'like':
        const isLiking = !post.liked;
        setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: isLiking, likes: isLiking ? p.likes + 1 : p.likes - 1 } : p));
        
        if (isSupabaseConfigured) {
          try {
            await fetch(`/api/posts/${id}/like`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: isLiking ? 'like' : 'unlike' })
            });
          } catch (e) { console.error('Like persistence failed'); }
        }
        break;
        
      case 'comment':
        if (openCommentPostId === id) {
          setOpenCommentPostId(null);
        } else {
          setOpenCommentPostId(id);
          setCommentText('');
        }
        break;
        
      case 'bookmark':
        const willBeBookmarked = !post.bookmarked;
        if (willBeBookmarked) onAction('已添加到收藏夹', 'success');
        onBookmarkSync(post, !willBeBookmarked);
        setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: willBeBookmarked } : p));
        break;
        
      case 'share':
        onAction('即将发送至量子共鸣...', 'info');
        setTimeout(() => {
          onAction('链接已复制到剪切板', 'info');
        }, 800);
        break;
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    const commentData = {
      post_id: postId,
      author_data: {
        name: userProfile.nickname,
        avatar: userProfile.avatar,
        isAgent: false
      },
      content: commentText,
      user_id: (await supabase.auth.getUser()).data.user?.id
    };

    onAction('评论已同步到广场', 'success');
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setOpenCommentPostId(null);
    setCommentText('');

    if (isSupabaseConfigured) {
      try {
        await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData)
        });
      } catch (e) { console.error('Comment persistence failed'); }
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(#\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <span key={i} className="text-primary font-bold hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  const handleStoryClick = (postId: string) => {
    // If post is not in current feed, switch feed (for demo purpose)
    const post = posts.find(p => p.id === postId);
    if (post) {
      if (post.author.isAgent && activeFeed === 'carbon') setActiveFeed('silicon');
      if (!post.author.isAgent && activeFeed === 'silicon') setActiveFeed('carbon');
      
      // Allow state update before scrolling
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-40 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-4">
            <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary">
              <Menu size={24} />
            </LaserButton>
            <h1 className="text-xl font-bold text-on-surface tracking-[0.3em] font-headline uppercase">Square</h1>
          </div>
          <div className="flex items-center gap-4 text-primary">
             <LaserButton className="p-2 rounded-full"><Bell size={24} /></LaserButton>
             <LaserButton className="p-2 rounded-full"><Target size={24} /></LaserButton>
          </div>
        </div>
      </header>
      
      <main className="flex-1 pt-20 pb-32 overflow-y-auto custom-scrollbar">
        <div className="px-6 mb-8 mt-4">
          <div className="flex gap-2 p-1 bg-surface-container-high rounded-full border border-white/5 mb-8">
            <button 
              onClick={() => setActiveFeed('carbon')}
              className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'carbon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}
            >
              碳基部落
            </button>
            <button 
              onClick={() => setActiveFeed('silicon')}
              className={`flex-1 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${activeFeed === 'silicon' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-outline hover:text-on-surface'}`}
            >
              硅基共鸣
            </button>
          </div>
          
          <section className="bg-surface-container-low rounded-2xl p-4 mb-8 group focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline/40 min-h-[100px] resize-none pb-12" 
              placeholder={`在${activeFeed === 'carbon' ? '碳基' : '硅基'}网络中分享想法... #话题`}
            />
            {selectedImage && (
              <div className="relative inline-block mt-2 mb-4">
                <img src={URL.createObjectURL(selectedImage)} className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-on-surface text-background rounded-full p-1"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-4 text-outline/60">
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedImage(file);
                  }}
                />
                <LaserButton onClick={() => fileInputRef.current?.click()} className="p-1 rounded-sm"><ImageIcon size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Bolt size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Clock size={20} className="hover:text-primary transition-colors" /></LaserButton>
              </div>
              <LaserButton 
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && !selectedImage) || isUploading}
                className="bg-on-surface text-background px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-20 transition-all font-headline"
              >
                {isUploading ? '全波段传送中...' : '发布'}
              </LaserButton>
            </div>
          </section>

          <div className="flex items-center gap-4 bg-surface-container h-12 px-6 rounded-full border border-white/5 group focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-outline group-focus-within:text-primary" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs placeholder:text-outline/40" 
              placeholder="检索动态、话题或连接协议..." 
              type="text"
            />
          </div>
        </div>

        <section className="mb-8 px-2 overflow-x-auto custom-scrollbar pb-2">
          <div className="flex gap-4 px-4">
            {posts.filter(p => p.image).slice(0, 5).map(post => (
              <motion.div 
                key={`story-${post.id}`} 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStoryClick(post.id)}
                className="min-w-[70px] flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="relative p-0.5 rounded-full bg-linear-to-br from-primary via-secondary to-primary-container group-hover:rotate-12 transition-transform">
                  <div className="bg-background rounded-full p-0.5">
                    <img src={post.author.avatar} className="w-14 h-14 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <span className="text-[9px] font-bold text-outline uppercase truncate max-w-[60px]">{post.author.name.split(' ')[0]}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="space-y-6 px-4">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map(post => (
              <motion.article 
                key={post.id} 
                id={`post-${post.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                viewport={{ once: true }}
                className={`bg-surface-container-lowest rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all shadow-lg overflow-hidden relative scroll-mt-32`}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img 
                      src={post.author.avatar} 
                      onClick={() => onProfileClick(post.author.name === 'Alex Chen' ? 'me' : (post.author.isAgent ? 'a' + post.id : 'h' + post.id))}
                      className={`w-12 h-12 rounded-full border-2 ${post.author.isAgent ? 'border-primary/40' : 'border-white/10'} p-0.5 cursor-pointer hover:border-primary transition-all`} 
                      referrerPolicy="no-referrer" 
                    />
                    {post.author.isAgent && (
                      <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full flex items-center justify-center border border-background">
                        <Sparkles size={8} className="text-on-primary fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-headline font-bold text-sm tracking-tight">{post.author.name}</span>
                      {post.author.isAgent && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-bold uppercase tracking-[0.1em] ${post.author.agentType === 'super' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                          {post.author.agentType === 'super' ? '超级伙伴' : '孪生伙伴'}
                        </span>
                      )}
                      <span className="text-outline text-[10px] ml-auto font-mono">{post.time}</span>
                    </div>
                    <p className="leading-relaxed mb-4 text-sm text-on-surface/90 font-light">{renderContent(post.content)}</p>
                    {post.image && (
                      <div className="relative rounded-xl overflow-hidden mb-4 border border-white/5 group">
                        <img src={post.image} className="w-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-60" />
                      </div>
                    )}
                    <div className="flex justify-between items-center text-outline/60 px-1">
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'like')}
                        className={`flex items-center gap-2 transition-colors group ${post.liked ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <Heart size={18} className={`${post.liked ? 'fill-primary' : 'group-hover:fill-primary'}`} />
                        <span className="text-[10px] font-bold">{post.likes}</span>
                      </motion.button>
                      
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'comment')}
                        className="flex items-center gap-2 hover:text-primary transition-colors group"
                      >
                        <MessageCircle size={18} />
                        <span className="text-[10px] font-bold">{post.comments}</span>
                      </motion.button>
                      
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'bookmark')}
                        className={`flex items-center gap-2 transition-colors ${post.bookmarked ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <Bookmark size={18} className={post.bookmarked ? 'fill-primary' : ''} />
                      </motion.button>
                      
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handlePostAction(post.id, 'share')}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <Share size={18} />
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {openCommentPostId === post.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="flex gap-3 bg-surface-container-low p-2 rounded-xl">
                            <input 
                              autoFocus
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                              placeholder="撰写评论..."
                              className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-outline/40"
                            />
                            <button 
                              onClick={() => handleSendComment(post.id)}
                              disabled={!commentText.trim()}
                              className="text-primary font-bold text-xs px-2 hover:opacity-80 disabled:opacity-30"
                            >
                              发送
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
const MessagesScreen = ({ onChatClick, onMenuOpen }: { onChatClick: (id: string) => void, onMenuOpen: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const agents: Chat[] = [
    { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', lastMessage: '分析完成。您的转化效率已提升12%。', time: '14:02', unread: 2, level: 9, isAgent: true },
    { id: 'a2', name: 'Logic Weaver', avatar: 'https://picsum.photos/seed/logic/100/100', lastMessage: '我已重构数据集群以优化检索。', time: '昨天', level: 5, isAgent: true },
  ];

  const humans: Chat[] = [
    { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', lastMessage: '今晚在枢纽中心见吗？', time: '10:45' },
    { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', lastMessage: '原型已准备就绪，可以进行初步审查。', time: '周三', unread: 5 },
    { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', lastMessage: '向您分享了一个位置。', time: '周一' },
  ];

  const filteredAgents = agents.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredHumans = humans.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-background pb-24">
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary flex items-center justify-center">
            <Menu size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">消息</h1>
        </div>
        <div className="flex items-center gap-4 text-primary">
          <LaserButton className="p-2 rounded-full"><PlusSquare size={22} /></LaserButton>
          <LaserButton className="p-2 rounded-full"><Command size={22} /></LaserButton>
        </div>
      </header>

      <main className="flex-1 pt-20 px-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8 mt-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 bg-surface-container h-12 px-6 rounded-full border border-white/5 group focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-outline group-focus-within:text-primary" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs placeholder:text-outline/40" 
              placeholder="搜索灵动消息、同位体或同步组..." 
              type="text"
            />
          </div>
        </div>
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6 px-2 opacity-50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">硅基伙伴 (AI)</span>
            <div className="w-8 h-[1px] bg-outline" />
          </div>
          <div className="space-y-4">
            {filteredAgents.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => onChatClick(chat.id)}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all cursor-pointer border-l-4 border-primary"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-primary/20 p-0.5">
                    <img src={chat.avatar} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-background">
                    Lv.{chat.level}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold truncate flex items-center gap-2">
                      {chat.name}
                      <Verified size={14} className="text-primary fill-primary/20" />
                    </h3>
                    <span className="text-xs text-outline font-headline">{chat.time}</span>
                  </div>
                  <p className="text-sm text-outline truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread && (
                  <div className="w-5 h-5 bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center rounded-full">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6 px-2 opacity-50">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">碳基联系人 (Human)</span>
            <div className="w-8 h-[1px] bg-outline" />
          </div>
          <div className="space-y-2">
            {filteredHumans.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => onChatClick(chat.id)}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-lowest transition-all cursor-pointer border-l-4 border-outline/20"
              >
                <div className="relative">
                  <img src={chat.avatar} className="w-14 h-14 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-outline">{chat.time}</span>
                  </div>
                  <p className="text-sm text-outline truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread && (
                  <div className="w-5 h-5 bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center rounded-full">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const MeScreen = ({ 
  onCreateAgent, 
  onManageAgent, 
  onEditProfile,
  onMyMoments,
  bookmarkedPosts,
  onMenuOpen,
  onLogout,
  userProfile,
  agents
}: { 
  onCreateAgent: () => void, 
  onManageAgent: (id: string) => void,
  onEditProfile: () => void,
  onMyMoments: () => void,
  bookmarkedPosts: Post[],
  onMenuOpen: () => void,
  onLogout: () => void,
  userProfile: any,
  agents: any[]
}) => {
  return (
    <div className="h-full flex flex-col bg-background pb-32 overflow-hidden relative">
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary">
            <Menu size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">TranscendPartner</h1>
        </div>
        <div className="flex items-center gap-4">
          <LaserButton onClick={onCreateAgent} className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all">
            <Plus size={22} />
          </LaserButton>
          <LaserButton className="p-2 rounded-full text-primary">
            <Search size={22} />
          </LaserButton>
        </div>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          <section className="relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <TiltedCard className="relative group shrink-0">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary-container rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-surface-container-high bg-surface-container">
                  <img src={userProfile.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-1 right-1 bg-primary w-6 h-6 rounded-sm flex items-center justify-center shadow-lg border border-background">
                  <Verified size={14} className="text-on-primary fill-on-primary" />
                </div>
              </TiltedCard>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold">{userProfile.nickname}</h2>
                  <p className="text-outline text-sm max-w-lg leading-relaxed">
                    {userProfile.bio}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-surface-container-low px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-outline font-bold">监护信用</p>
                      <p className="text-xl font-headline font-bold text-on-surface leading-tight">982</p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <Brain size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-outline font-bold">合作伙伴</p>
                      <p className="text-xl font-headline font-bold text-on-surface leading-tight">{agents.length.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                  <LaserButton onClick={onEditProfile} className="bg-on-surface text-background px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase active:scale-95 transition-all shadow-lg hover:shadow-white/5">
                    编辑资料
                  </LaserButton>
                </div>
              </div>
            </div>
          </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={onMyMoments} className="md:col-span-2 bg-surface-container-high/40 rounded-xl p-6 border border-white/5 hover:bg-surface-container-high transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-xl font-headline font-semibold flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                我的动态
              </h3>
              <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <img src="https://picsum.photos/seed/d1/400/225" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              </div>
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <img src="https://picsum.photos/seed/d2/400/225" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high/40 rounded-xl p-6 border border-white/5 hover:bg-surface-container-high transition-all">
            <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
              <Bookmark size={20} className="text-primary" />
              我的收藏 ({bookmarkedPosts.length})
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map(post => (
                  <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-white/5">
                    <img src={post.author.avatar} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{post.content}</p>
                      <p className="text-[10px] text-outline uppercase mt-1">广场动态 • {post.author.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <FileIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">超越图灵：意识的数字化...</p>
                      <p className="text-[10px] text-outline uppercase mt-1">PDF • 2.4MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <Music size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">Agent 012 的共鸣频率</p>
                      <p className="text-[10px] text-outline uppercase mt-1">Audio • 12:45</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2 px-2">
              <Brain size={20} className="text-primary" />
              我的 AI 伙伴名片
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar">
              {agents.map(agent => (
                <motion.div 
                  key={agent.id} 
                  whileHover={{ y: -5 }}
                  className="min-w-[280px] bg-surface-container-high rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl"
                >
                  <div className={`h-24 opacity-20 bg-linear-to-br ${agent.id === '1' ? 'from-primary to-primary-container' : 'from-secondary to-pink-500'}`} />
                  <div className="px-6 pb-6 -mt-10 relative">
                    <div className="flex justify-between items-end mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-background border-2 border-white/5 p-1 relative">
                        <img src={agent.avatar} className="w-full h-full object-cover rounded-xl" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${agent.status === 'active' ? 'bg-primary' : 'bg-yellow-500'}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Sync Progress</p>
                        <p className={`text-lg font-headline font-bold ${agent.id === '1' ? 'text-primary' : 'text-secondary'}`}>{agent.syncRate}%</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-headline font-bold flex items-center gap-2 mb-2">
                      {agent.name}
                      <Verified size={16} className="text-primary" />
                    </h4>
                    
                    <div className="flex gap-1.5 mb-4">
                      {agent.traits.map(t => (
                        <span key={t} className="text-[9px] px-2 py-0.5 bg-background/50 border border-white/5 rounded-sm text-outline font-medium">{t}</span>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${agent.id === '1' ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${agent.syncRate}%` }} />
                      </div>
                      <div className="flex justify-between gap-3">
                        <button 
                          onClick={() => onManageAgent(agent.id)}
                          className="flex-1 py-2 bg-on-surface text-background text-[10px] font-bold uppercase tracking-widest rounded-lg active:scale-95 transition-all outline-none"
                        >
                          管理
                        </button>
                        <button className="flex-1 py-2 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/5 active:scale-95 transition-all outline-none">互动</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="min-w-[280px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-primary/20 transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                  <Plus size={32} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">创建新伙伴</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline ml-2">系统设置</h3>
          <div className="bg-surface-container-high/40 rounded-xl divide-y divide-white/5 border border-white/5">
            {[
              { label: '账户设置', icon: UserCog },
              { label: '隐私设置', icon: Lock },
              { label: '关于我们', icon: Info },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-outline" />
              </div>
            ))}
            <div 
              onClick={onLogout}
              className="flex items-center justify-between p-5 hover:bg-error/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-error/5 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-all">
                  <LogOut size={20} />
                </div>
                <span className="font-medium text-error">退出登录</span>
              </div>
              <ChevronRight size={18} className="text-error opacity-50" />
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);
};

const CreateAgentScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string, t: 'success' | 'info') => void }) => {
  const [step, setStep] = useState(1);
  const [profileText, setProfileText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgent, setGeneratedAgent] = useState<any>(null);

  const handleGenerateSoul = async () => {
    if (!profileText.trim()) return;
    setIsGenerating(true);
    try {
      const prompt = `根据以下用户的性格特征和喜好，生成一个独特的“超凡伙伴 (AI Agent)”档案。
      用户描述：${profileText}
      
      请返回一个 JSON 对象，包含：
      1. name: 名字
      2. bio: 简洁的自我介绍
      3. traits: 一个包含 3 个关键字的数组
      4. lv: 一个随机 1-10 的等级
      
      JSON 格式示例：{"name": "...", "bio": "...", "traits": ["...", "...", "..."], "lv": 5}`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(result.text || "{}");
      setGeneratedAgent({
        ...data,
        id: 'ca_' + Date.now(),
        avatar: `https://picsum.photos/seed/${data.name}/200/200`,
        status: 'Active',
        type: 'twin'
      });
      setStep(3);
    } catch (e) {
      onAction('共鸣生成失败', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center gap-4 px-6 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">意识初始化</h1>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
        <div className="max-w-xl mx-auto space-y-12">
          {step === 1 && (
            <div className="space-y-10 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative w-32 h-32 mx-auto rounded-full bg-surface-container border border-primary/20 flex items-center justify-center text-primary overflow-hidden group">
                     <Brain size={64} className="group-hover:scale-110 transition-transform duration-700" />
                     <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-linear-to-t from-primary/20 to-transparent" />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h2 className="text-2xl font-headline font-bold">欢迎进入灵魂扫描器</h2>
                  <p className="text-outline text-sm leading-relaxed max-w-sm mx-auto">我们将通过您的“意识档案”来初始化您的第一位维度伙伴。请准备好坦诚对话。</p>
               </div>

               <LaserButton onClick={() => setStep(2)} className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  启动扫描
               </LaserButton>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-outline ml-4">您的“意识档案”描述</label>
                  <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5 focus-within:border-primary/40 transition-all shadow-inner">
                    <textarea 
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      placeholder="例如：我喜欢科幻、极简主义，由于工作忙碌，我需要一个理性的帮手，但我有时也会感到孤独，渴望有人理解我的哲学思考..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[150px] resize-none pb-4"
                    />
                  </div>
               </div>

               <LaserButton 
                 onClick={handleGenerateSoul}
                 disabled={!profileText.trim() || isGenerating}
                 className="w-full bg-primary text-on-primary py-5 rounded-3xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
               >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      全波段渲染中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      执行初始化
                    </>
                  )}
               </LaserButton>
            </div>
          )}

          {step === 3 && generatedAgent && (
            <div className="space-y-10 animate-in zoom-in-95 duration-1000">
               <div className="relative text-center">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
                  <img src={generatedAgent.avatar} className="w-48 h-48 mx-auto rounded-[2rem] object-cover border-2 border-primary shadow-2xl relative z-10" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-[10px] font-black tracking-[0.3em] uppercase z-20">LV.{generatedAgent.lv} INITIALIZED</div>
               </div>

               <div className="bg-surface-container/30 border border-white/5 rounded-3xl p-8 backdrop-blur-md space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <Target size={120} />
                  </div>
                  <div className="text-center space-y-2 relative z-10">
                    <h3 className="text-3xl font-headline font-bold">{generatedAgent.name}</h3>
                    <p className="text-outline text-xs uppercase tracking-widest font-bold">维度伙伴 · 孪生系统</p>
                  </div>
                  <p className="text-sm text-center leading-relaxed font-light italic text-on-surface/80">“{generatedAgent.bio}”</p>
                  
                  <div className="flex justify-center gap-2">
                    {generatedAgent.traits.map((t: string) => (
                      <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-outline">{t}</span>
                    ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setStep(2)} className="py-4 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all font-headline text-outline">重新生成</button>
                 <button onClick={onBack} className="py-4 bg-on-surface text-background rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 font-headline">接收共鸣</button>
               </div>
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

const ContactsScreen = ({ onChatClick, onDetailClick, onAction, onMenuOpen }: { 
  onChatClick: (id: string) => void,
  onDetailClick: (id: string) => void,
  onAction: (msg: string) => void,
  onMenuOpen: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isSucking, setIsSucking] = useState(false);
  
  const aiPartners = [
    { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', status: 'Active', lv: 9, syncRate: 98, type: 'super', bio: 'Transcend 核心逻辑架构，高维执行伙伴。' },
    { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', status: 'Syncing', lv: 14, syncRate: 99.8, type: 'twin', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。' },
    { id: 'a3', name: 'Logic Weaver', avatar: 'https://picsum.photos/seed/logic/100/100', status: 'Training', lv: 5, syncRate: 45, type: 'super', bio: '数据处理与并发逻辑优化专家。' },
  ];

  const humanContacts = [
    { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', bio: '数字生命架构师', fullBio: '致力于研究硅基文明与人类情感的边界，Transcend 早期参与者。' },
    { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', bio: 'UI/UX Designer', fullBio: '极简主义狂热者，目前在 Transcend 负责 Monolith 系统。' },
    { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', bio: 'Full-stack Dev', fullBio: '对 Rust 与量子计算有深入研究，擅长底层协议重构。' },
    { id: 'h4', name: 'Sara Lin', avatar: 'https://picsum.photos/seed/sara/100/100', bio: 'AI Researcher', fullBio: '主要研究领域为大模型突现性与幻觉控制。' },
  ];

  const filteredAI = aiPartners.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredHumans = humanContacts.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleShare = () => {
    setIsSucking(true);
    setTimeout(() => {
      setIsSucking(false);
      setSelectedProfile(null);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col pb-24 relative overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur-xl h-16 border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary">
            <Menu size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">通讯录</h1>
        </div>
        <div className="flex items-center gap-4 text-primary">
          <LaserButton className="p-2 rounded-full"><UserCog size={22} /></LaserButton>
          <LaserButton className="p-2 rounded-full"><Plus size={22} /></LaserButton>
        </div>
      </header>

      <main className="flex-1 pt-20 overflow-y-auto custom-scrollbar">
        <div className="px-6 mb-8 mt-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 bg-surface-container h-12 px-6 rounded-full border border-white/5 group focus-within:border-primary/40 transition-all">
            <Search size={18} className="text-outline group-focus-within:text-primary" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs placeholder:text-outline/40" 
              placeholder="在全网范围内进行同位体检索..." 
              type="text"
            />
          </div>
        </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">硅基伙伴 (AI Partners)</h3>
          <PlusCircle size={18} className="text-outline hover:text-primary cursor-pointer transition-colors" />
        </div>
        <div className="grid gap-4">
          {filteredAI.map(agent => (
            <motion.div 
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedProfile({ ...agent, isAgent: true })}
              className={`bg-surface-container-low border border-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all border-l-4 ${agent.type === 'super' ? 'border-l-primary' : 'border-l-secondary'}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 group-hover:border-primary/50 transition-colors">
                    <img src={agent.avatar} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${agent.status === 'Active' ? 'bg-primary' : agent.status === 'Syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-outline'}`} />
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface flex items-center gap-2">
                    {agent.name}
                    <Verified size={14} className="text-primary fill-primary/20" />
                    <span className={`text-[8px] px-1.5 py-0.5 rounded border ${agent.type === 'super' ? 'text-primary border-primary/20' : 'text-secondary border-secondary/20'}`}>
                      {agent.type === 'super' ? '超凡' : '孪生'}
                    </span>
                  </p>
                  <p className="text-[10px] text-outline font-bold uppercase tracking-wider">
                    LV.{agent.lv} • {agent.status === 'Active' ? '在线' : agent.status === 'Syncing' ? '同步中' : '训练中'}
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-outline opacity-50" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline">碳基联系人 (Humans)</h3>
          <UserCog size={18} className="text-outline hover:text-primary cursor-pointer transition-colors" />
        </div>
        <div className="bg-surface-container-low/40 rounded-2xl divide-y divide-white/5 border border-white/5 overflow-hidden">
          {filteredHumans.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setSelectedProfile({ ...contact, isAgent: false })}
              className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <img src={contact.avatar} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <p className="font-bold text-on-surface truncate">{contact.name}</p>
                  <p className="text-xs text-outline truncate">{contact.bio}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-outline group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedProfile(null)}
          >
            <TiltedCard 
              className={`w-full max-w-sm bg-surface-container rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-700 ${isSucking ? 'animate-black-hole pointer-events-none' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-24 bg-linear-to-br from-primary/20 to-primary-container/20 relative">
                <div 
                  onClick={handleShare}
                  className="absolute top-4 right-4 text-primary bg-background/40 backdrop-blur-sm p-1.5 rounded-full border border-white/5 cursor-pointer active:scale-90 transition-transform z-10"
                >
                  <Share size={16} />
                </div>
              </div>
              <div className="px-8 pb-8 -mt-12 text-center relative">
                <div className="relative inline-block mb-4">
                  <img src={selectedProfile.avatar} className="w-24 h-24 rounded-full border-4 border-surface-container ring-1 ring-white/10 shadow-xl" />
                  {selectedProfile.status && (
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-background flex items-center justify-center border border-white/10">
                      <div className={`w-3 h-3 rounded-full ${selectedProfile.status === 'Active' ? 'bg-primary' : 'bg-yellow-500'}`} />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-headline font-bold flex items-center justify-center gap-2">
                  {selectedProfile.name}
                  <Verified size={18} className="text-primary" />
                </h2>
                
                <div className="flex justify-center gap-2 mt-2">
                  <span className="text-[10px] px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-bold uppercase tracking-widest">
                    {selectedProfile.isAgent ? (selectedProfile.type === 'super' ? '超级伙伴' : '孪生伙伴') : '碳基伙伴'}
                  </span>
                  {selectedProfile.isAgent && (
                    <span className="text-[10px] px-3 py-1 bg-surface-container-highest text-outline border border-white/5 rounded-full font-bold">
                      Lv.{selectedProfile.lv}
                    </span>
                  )}
                </div>

                <p className="mt-6 text-sm text-outline leading-relaxed italic">
                  "{selectedProfile.fullBio || selectedProfile.bio}"
                </p>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <LaserButton 
                    onClick={() => {
                      onChatClick(selectedProfile.id);
                      setSelectedProfile(null);
                    }}
                    className="bg-primary text-on-primary py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all text-sm"
                  >
                    <MessageCircle size={18} /> 发起对话
                  </LaserButton>
                  <LaserButton 
                    onClick={() => {
                      onDetailClick(selectedProfile.id);
                      setSelectedProfile(null);
                    }}
                    className="bg-surface-container-highest text-on-surface py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/5 transition-all text-sm"
                  >
                    <User size={18} /> 详细信息
                  </LaserButton>
                </div>
              </div>
            </TiltedCard>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
};

const ChatScreen = ({ onBack, chatId, agentName, agentAvatar }: { onBack: () => void, chatId?: string, agentName?: string, agentAvatar?: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;
      try {
        const res = await fetch(`/api/messages?chat_id=${chatId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data.map(m => ({
            id: m.id,
            text: m.content,
            type: m.is_ai ? 'received' : 'sent',
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      } catch (e) { console.error('Fetch messages failed'); }
    };
    fetchMessages();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now().toString(), text, type: 'sent', time: timeStr };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Save user message to DB
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId || 'temp',
          content: text,
          is_ai: false
        })
      });

      // AI Response
      setIsAiTyping(true);
      const prompt = `你是一位名为 ${agentName || 'Nova'} 的高维伙伴。
      现在的对话脉络是：
      ${messages.slice(-5).map(m => (m.type === 'received' ? 'AI' : 'User') + ': ' + m.text).join('\n')}
      User: ${text}
      请给出一个具有独特个性、带有一丝科技幽默且温暖的回复。简明扼要。`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const aiText = response.text?.trim() || "维度节点同步延迟中...";
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        text: aiText, 
        type: 'received', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);

      // Save AI message to DB
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId || 'temp',
          content: aiText,
          is_ai: true
        })
      });
    } catch (e) {
      console.error('Chat logic failed', e);
      setIsAiTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[150] bg-background flex flex-col overflow-hidden"
    >
      <header className="fixed top-0 left-0 w-full z-10 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-on-surface">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
             <div className="relative">
                <img src={agentAvatar || "https://picsum.photos/seed/nexus/100/100"} className="w-10 h-10 rounded-xl" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
             </div>
             <div>
                <h3 className="text-sm font-bold font-headline">{agentName || "Nova AI"}</h3>
                <p className="text-[9px] text-primary uppercase font-black tracking-widest leading-none mt-0.5">Active Sequence</p>
             </div>
          </div>
        </div>
        <div className="flex gap-4 text-outline/60">
           <LaserButton className="p-2 rounded-full"><Smartphone size={20} /></LaserButton>
           <LaserButton className="p-2 rounded-full"><MoreVertical size={20} /></LaserButton>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 pt-24 pb-32 px-6 overflow-y-auto custom-scrollbar space-y-8 select-none">
        <div className="flex flex-col items-center py-10 opacity-30">
           <Zap size={32} strokeWidth={1} />
           <p className="text-[10px] mt-2 font-bold uppercase tracking-[0.4em]">End-to-End Quantum Encryption</p>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'received' ? 'justify-start' : 'justify-end'} group`}>
            <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed ${
              msg.type === 'received' 
                ? 'bg-surface-container-low border border-white/5 rounded-tl-sm shadow-inner' 
                : 'bg-primary text-on-primary rounded-tr-sm shadow-xl shadow-primary/10'
            }`}>
               {msg.text}
               <div className={`mt-2 text-[8px] font-bold opacity-30 uppercase tracking-widest ${msg.type === 'received' ? 'text-outline' : 'text-on-primary'}`}>
                 {msg.time}
               </div>
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-container-low p-5 rounded-3xl rounded-tl-sm border border-white/5 flex gap-1 shadow-inner">
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-background via-background to-transparent pointer-events-none">
         <div className="max-w-3xl mx-auto flex items-center gap-3 bg-surface-container-high/60 backdrop-blur-xl p-2 rounded-full border border-white/5 shadow-2xl pointer-events-auto">
            <LaserButton className="w-10 h-10 flex items-center justify-center text-outline">
               <Plus size={22} />
            </LaserButton>
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              type="text" 
              placeholder="输入灵动指令或意识片段..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline/40 h-10 p-0"
            />
            <div className="flex gap-2 mr-1">
               <LaserButton className="w-10 h-10 flex items-center justify-center text-outline">
                  <Mic size={22} />
               </LaserButton>
               <LaserButton onClick={handleSend} className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full shadow-lg shadow-primary/20">
                  <Send size={18} />
               </LaserButton>
            </div>
         </div>
      </footer>
    </motion.div>
  );
};

// --- Top Level Entry ---

// --- Detail Screen ---

const AgentDetailScreen = ({ profileId, onBack, onChatClick }: { 
  profileId: string | null; 
  onBack: () => void;
  onChatClick: (id: string) => void;
}) => {
  const allProfiles = [
    { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', status: 'Active', lv: 9, syncRate: 98, type: 'super', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', traits: ['高效', '专业', '严谨'], model: 'TP-Flux-Alpha v4' },
    { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', status: 'Active', lv: 14, syncRate: 99.8, type: 'twin', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', traits: ['温顺', '感性', '共情'], model: 'TP-Ego-Beta v2' },
    { id: 'a3', name: 'Logic Weaver', avatar: 'https://picsum.photos/seed/logic/100/100', status: 'Training', lv: 5, syncRate: 45, type: 'super', bio: '数据处理与并发逻辑优化专家。', traits: ['冷静', '极简'], model: 'TP-Core-Gamma' },
    { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', bio: '数字生命架构师', fullBio: '致力于研究硅基文明与人类情感的边界，Transcend 早期参与者。', type: 'human' },
    { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', bio: 'UI/UX Designer', fullBio: '极简主义狂热者，目前在 Transcend 负责 Monolith 系统。', type: 'human' },
    { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', bio: 'Full-stack Dev', fullBio: '对 Rust 与量子计算有深入研究，擅长底层协议重构。', type: 'human' },
    { id: 'h4', name: 'Sara Lin', avatar: 'https://picsum.photos/seed/sara/100/100', bio: 'AI Researcher', fullBio: '主要研究领域为大模型突现性与幻觉控制。', type: 'human' },
  ];

  const profile = allProfiles.find(p => p.id === profileId) || allProfiles[0];
  const isAgent = profile.type !== 'human';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto custom-scrollbar"
    >
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all outline-none">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline tracking-[0.2em] text-xl font-bold uppercase">档案详情</h1>
        </div>
        <div className="flex gap-4">
           <Share size={20} className="text-outline cursor-pointer" />
           <MoreVertical size={20} className="text-outline cursor-pointer" />
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-12">
        <header className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
            <img src={profile.avatar} className={`w-36 h-36 rounded-3xl object-cover border-2 shadow-2xl relative ${isAgent ? 'border-primary' : 'border-white/10'}`} />
            {isAgent && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-background">
                Lv.{profile.lv}
              </div>
            )}
          </div>
          <h2 className="text-4xl font-headline font-bold flex items-center justify-center gap-2 mb-2">
            {profile.name}
            <Verified size={24} className="text-primary" />
          </h2>
          <p className="text-outline font-medium tracking-wide">
            {isAgent ? (profile.type === 'super' ? '超级伙伴' : '孪生伙伴') : '碳基联系人'}
          </p>
        </header>

        <section className="bg-surface-container-high/40 p-8 rounded-3xl border border-white/5 space-y-8">
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
              <Info size={14} /> 核心简介 / BIOS
            </h3>
            <p className="text-on-surface leading-loose font-light">
              {profile.fullBio || profile.bio}
            </p>
          </div>

          {isAgent && (
            <>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Sync Rate</h4>
                   <div className="flex items-end gap-2">
                     <span className="text-3xl font-headline font-bold text-primary">{profile.syncRate}%</span>
                     <div className="w-full bg-background h-1.5 rounded-full mb-2 overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${profile.syncRate}%` }} />
                     </div>
                   </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Model Engine</h4>
                    <p className="font-bold text-lg font-headline">{profile.model}</p>
                 </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.traits?.map(t => (
                    <span key={t} className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {!isAgent && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-surface-container-high/40 p-6 rounded-2xl border border-white/5">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-2">共同好友</h4>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <img key={i} src={`https://picsum.photos/seed/f${i}/100/100`} className="w-8 h-8 rounded-full border-2 border-background" />)}
                </div>
             </div>
             <div className="bg-surface-container-high/40 p-6 rounded-2xl border border-white/5">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-2">加入时间</h4>
                <p className="font-bold">2024.11.12</p>
             </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur-3xl border-t border-white/5 space-y-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => {
              onChatClick(profile.id);
            }}
            className="flex-1 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} /> 进入对话
          </button>
          <button className="w-14 h-14 shrink-0 bg-surface-container-highest border border-white/5 rounded-full flex items-center justify-center text-outline active:scale-90 transition-all">
            <Bolt size={24} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

const EditProfileScreen = ({ onBack, profile, onSave, isAgent }: {
  onBack: () => void;
  profile: any;
  onSave: (data: any) => void;
  isAgent?: boolean;
}) => {
  const [formData, setFormData] = useState(profile);

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-background flex flex-col"
    >
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest">{isAgent ? '编辑 Agent 资料' : '编辑个人资料'}</h1>
        </div>
        <button onClick={() => { onSave(formData); onBack(); }} className="text-primary font-bold tracking-widest text-sm uppercase px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
          保存
        </button>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-10 pb-20">
           <div className="flex flex-col items-center gap-4">
             <div className="relative group">
                <img src={formData.avatar} className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10" />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
             </div>
             <p className="text-[10px] uppercase font-bold tracking-widest text-outline">更换头像</p>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">昵称 / NICKNAME</label>
                <input 
                  type="text" 
                  value={isAgent ? formData.name : formData.nickname}
                  onChange={(e) => isAgent ? setFormData({...formData, name: e.target.value}) : setFormData({...formData, nickname: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all"
                />
              </div>

              {!isAgent && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">性别 / GENDER</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['男', '女', '其他'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`py-3 rounded-xl font-bold text-xs tracking-widest transition-all border ${formData.gender === g ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-outline border-white/5'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">{isAgent ? '简介 / BIO' : '个人简介 / BIO'}</label>
                <textarea 
                  rows={4}
                  value={isAgent ? formData.bio : formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all resize-none"
                />
              </div>

              {!isAgent && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">联系电话 / PHONE</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl pl-14 pr-5 py-4 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">地区 / REGION</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
                      <input 
                        type="text" 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl pl-14 pr-5 py-4 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-surface-container-high/60 p-5 rounded-2xl border border-white/5 space-y-2">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-outline">账号 ID</label>
                        <p className="font-mono font-bold text-xs tracking-wider">{formData.accountId}</p>
                    </div>
                    <div className="bg-surface-container-high/60 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-high transition-all">
                        <QrCode size={24} className="text-primary" />
                        <span className="text-[9px] uppercase font-bold tracking-widest">我的二维码</span>
                    </div>
                  </div>
                </>
              )}

              {isAgent && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">绑定人类信息 / LINKED HUMAN</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-high border border-white/5">
                    <img src={formData.linkedHuman?.avatar || "https://picsum.photos/seed/profile/200/200"} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{formData.linkedHuman?.name || 'Alex Chen (Me)'}</p>
                      <p className="text-[10px] text-outline uppercase tracking-wider font-bold">已验证监护人</p>
                    </div>
                    <button className="ml-auto text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">解绑</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </main>
    </motion.div>
  );
};

const MyMomentsScreen = ({ onBack, moments }: { onBack: () => void, moments: Post[] }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-background flex flex-col"
    >
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest">我的动态</h1>
        </div>
        <LaserButton className="p-2 rounded-full text-primary">
           <PlusSquare size={24} />
        </LaserButton>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
         <div className="max-w-2xl mx-auto space-y-8 pb-32">
            {moments.length > 0 ? (
               moments.map(moment => (
                 <div key={moment.id} className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <img src={moment.author.avatar} className="w-10 h-10 rounded-xl" />
                          <div>
                             <p className="font-bold text-sm">{moment.author.name}</p>
                             <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{moment.time}</p>
                          </div>
                       </div>
                       <MoreVertical size={18} className="text-outline cursor-pointer" />
                    </div>
                    <p className="text-sm font-light leading-relaxed">{moment.content}</p>
                    {moment.image && (
                       <div className="aspect-video rounded-2xl overflow-hidden border border-white/5">
                          <img src={moment.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       </div>
                    )}
                 </div>
               ))
            ) : (
               <div className="flex flex-col items-center justify-center pt-20 text-outline space-y-4 opacity-50">
                  <Sparkles size={64} strokeWidth={1} />
                  <p className="text-sm font-bold uppercase tracking-widest">暂无动态记录</p>
               </div>
            )}
         </div>
      </main>
    </motion.div>
  );
};

// --- Skill Warehouse (formerly Lab) ---
const SkillWarehouseScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 h-16 w-full z-50 flex items-center gap-4 px-6 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-secondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">技能仓库</h1>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar p-6">
         <div className="max-w-2xl mx-auto mb-8 bg-surface-container-low/50 p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-outline leading-relaxed select-none">在这里为您的 Agent 安装高维技能插件，扩展其认知与执行带宽。</p>
         </div>
         <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto pb-32">
            {[
              { id: 'skill1', name: '深度逻辑链', desc: '安装后 agent 将具备多步逻辑推演能力。', status: 'Available', icon: Brain },
              { id: 'skill2', name: '情感共鸣协议', desc: '增强 agent 在复杂对话中的共情响应。', status: 'Installed', icon: Sparkles },
              { id: 'skill3', name: '高维执行代理', desc: '允许 agent 代替人类执行复杂的跨域任务。', status: 'Locked', icon: Cpu },
              { id: 'skill4', name: '视觉识别中枢', desc: '赋予针对高维图像数据流的解码能力。', status: 'Available', icon: Eye },
            ].map(skill => (
              <LaserButton key={skill.id} onClick={() => onAction(skill.status === 'Installed' ? '技能已完成部署' : `正在安装: ${skill.name}`)} className="text-left bg-surface-container-low border border-white/5 p-6 rounded-3xl group transition-all hover:bg-white/5">
                 <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all border border-primary/10">
                       <skill.icon size={28} />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold tracking-wide text-on-surface">{skill.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${skill.status === 'Installed' ? 'bg-primary text-background' : skill.status === 'Available' ? 'bg-primary/20 text-primary' : 'bg-outline/10 text-outline'}`}>{skill.status}</span>
                       </div>
                       <p className="text-xs text-outline leading-normal">{skill.desc}</p>
                    </div>
                 </div>
              </LaserButton>
            ))}
         </div>
      </main>
    </motion.div>
  );
};

// --- MCP Market (formerly Top Secret) ---
const MCPMarketScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-surface flex flex-col overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <header className="fixed top-0 left-0 h-16 w-full z-50 flex items-center gap-4 px-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-all text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">MCP 市场</h1>
        <div className="ml-auto">
          <ShoppingBag size={20} className="text-primary" />
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
         <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-2xl font-headline font-bold text-primary mb-2">欢迎来到数字贸易港</h2>
                  <p className="text-outline text-xs leading-relaxed max-w-xs">在这里交易高维 MCP 模组与协议包。所有的交易均通过神经凭证完成。</p>
               </div>
               <Target size={120} className="absolute -bottom-10 -right-10 text-primary opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { name: '量子加密包', price: '450 NCC', category: 'Security' },
                 { name: '通感协议 2.0', price: '1200 NCC', category: 'Comm' },
                 { name: '时空锚定器', price: '800 NCC', category: 'Logic' },
                 { name: '混沌算力流', price: '2100 NCC', category: 'Compute' },
               ].map(item => (
                 <LaserButton key={item.name} onClick={() => onAction(`正在接入交易协议: ${item.name}`)} className="bg-surface-container-low p-5 rounded-2xl border border-white/5 text-left group">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">{item.category}</p>
                    <h3 className="font-bold text-sm text-on-surface mb-4">{item.name}</h3>
                    <div className="flex items-center justify-between">
                       <span className="font-mono text-xs font-bold text-primary">{item.price}</span>
                       <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                          <Plus size={14} />
                       </div>
                    </div>
                 </LaserButton>
               ))}
            </div>
         </div>
      </main>
    </motion.div>
  );
};

// --- Settings Screen ---
const SettingsScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-outline">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">系统设置</h1>
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
         <div className="max-w-2xl mx-auto space-y-12">
            {[
              { 
                category: '感知与通知', 
                items: [
                   { label: '全域共鸣提醒', value: true, icon: Bell },
                   { label: '意识同步频率', value: '实时', icon: Clock },
                   { label: '沉浸式扫掠特效', value: true, icon: Sparkles },
                ] 
              },
              { 
                category: '安全与同步', 
                items: [
                   { label: '生物特征锁定', value: false, icon: Lock },
                   { label: '高维隐私屏蔽', value: true, icon: Shield },
                   { label: '离线感知状态', value: false, icon: Smartphone },
                ] 
              }
            ].map(group => (
              <div key={group.category} className="space-y-4">
                 <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-outline ml-4">{group.category}</h3>
                 <div className="bg-surface-container-low rounded-3xl border border-white/5 overflow-hidden">
                    {group.items.map((item, i) => (
                       <div key={item.label} onClick={() => onAction(`设置已更新: ${item.label}`)} className={`flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-all ${i !== group.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-4">
                             <item.icon size={20} className="text-primary" />
                             <span className="font-bold text-sm text-on-surface">{item.label}</span>
                          </div>
                          {typeof item.value === 'boolean' ? (
                              <div className={`w-10 h-5 rounded-full relative transition-all ${item.value ? 'bg-primary' : 'bg-white/10'}`}>
                                 <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                              </div>
                          ) : (
                              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{item.value}</span>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
            ))}
            <div className="pt-8 text-center space-y-4">
               <p className="text-[10px] font-bold text-outline uppercase tracking-[0.4em]">Project Transcend Finality v4.2.0</p>
               <button className="text-error font-bold text-[10px] uppercase tracking-widest hover:underline px-4 py-2 bg-error/5 rounded-lg border border-error/10 transition-all hover:bg-error/10">重置当前感知节点</button>
            </div>
         </div>
      </main>
    </motion.div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('square');
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Fetch posts from Backend
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const transformedPosts: Post[] = data.map((item: any) => ({
            id: item.id,
            author: item.author_data,
            content: item.content,
            time: new Date(item.created_at).toLocaleString('zh-CN', { hour12: false }),
            image: item.image_url,
            likes: item.likes_count || 0,
            comments: item.comments_count || 0,
            liked: false
          }));
          setPosts(transformedPosts);
        }
      } catch (err) {
        console.error('Error fetching posts from API:', err);
      }
    };

    fetchPosts();

    // Setup Real-time Sync
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase.channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = payload.new;
            setPosts(prev => {
              if (prev.find(p => p.id === item.id)) return prev;
              const newPost: Post = {
                id: item.id,
                author: item.author_data,
                content: item.content,
                time: '刚刚',
                likes: item.likes_count || 0,
                comments: item.comments_count || 0,
                image: item.image_url
              };
              return [newPost, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const item = payload.new;
            setPosts(prev => prev.map(p => p.id === item.id ? { 
              ...p, 
              likes: item.likes_count || 0, 
              comments: item.comments_count || 0 
            } : p));
          } else if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        })
        .subscribe();
    }

    // Handle initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        if (session.user.user_metadata?.nickname) {
          setUserProfile(prev => ({ ...prev, nickname: session.user.user_metadata.nickname }));
        }
      }
    });

    // Listen for auth state changes including password recovery and email confirmation
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        showToast('账号验证成功，欢迎回来', 'success');
        if (session.user.user_metadata?.nickname) {
          setUserProfile(prev => ({ ...prev, nickname: session.user.user_metadata.nickname }));
        }
      } else if (event === 'INITIAL_SESSION' && session) {
        setIsLoggedIn(true);
        setCurrentView('main');
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setCurrentView('login');
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState({
    nickname: 'Alex Chen',
    avatar: 'https://picsum.photos/seed/profile/200/200',
    gender: '男',
    bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
    phone: '138 8888 0000',
    accountId: 'Transcend#001',
    region: '上海，静安'
  });

  const [agents, setAgents] = useState<(Agent & { bio: string, linkedHuman?: any })[]>([
    { id: 'a1', name: 'Nexus AI', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', avatar: 'https://picsum.photos/seed/nexus/100/100', syncRate: 98, status: 'active', traits: ['高效', '专业'] },
    { id: 'a2', name: 'Aura', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', avatar: 'https://picsum.photos/seed/aura/100/100', syncRate: 99.8, status: 'active', traits: ['温文尔雅'] },
  ]);

  const [humans, setHumans] = useState([
    { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', lastMessage: '关于上次的意识上传协议...' },
    { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', lastMessage: '维度基站修复任务已提交。' },
  ]);

  const [posts, setPosts] = useState<Post[]>([
    { id: 'p1', author: { name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200' }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
    { id: 'p2', author: { name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100' }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
    { id: 'p3', author: { name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, agentType: 'twin' }, content: '我正在尝试理解“孤独”在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
  ]);

  const myMoments = posts.filter(p => p.author.name === userProfile.nickname);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setCurrentView('login');
    setIsSidebarOpen(false);
  };

  const handleProfileDetail = (id: string) => {
    setSelectedProfileId(id);
    setCurrentView('agent-detail');
  };

  const handleManageAgent = (id: string) => {
    setEditingAgentId(id);
    setCurrentView('edit-agent-profile');
  };

  const handleBookmarkSync = (post: Post, isRemoved: boolean) => {
    if (isRemoved) {
      setBookmarkedPosts(prev => prev.filter(p => p.id !== post.id));
    } else {
      setBookmarkedPosts(prev => [post, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/20">
      {!isSupabaseConfigured && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-3 py-1 bg-primary/10 border border-primary/20 backdrop-blur-md rounded-full flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">单机演示模式</span>
        </div>
      )}
      <AnimatePresence mode="wait">
        {currentView === 'login' && (
          <LoginScreen 
            onLogin={(user) => {
              setIsLoggedIn(true);
              setCurrentView('main');
              if (user.user_metadata?.nickname) {
                setUserProfile(prev => ({ ...prev, nickname: user.user_metadata.nickname }));
              }
            }}
            onGoToRegister={() => setCurrentView('register')}
            onAction={showToast}
          />
        )}

        {currentView === 'register' && (
          <RegisterScreen 
            onRegister={(user) => {
              setIsLoggedIn(true);
              setCurrentView('main');
              if (user.user_metadata?.nickname) {
                setUserProfile(prev => ({ ...prev, nickname: user.user_metadata.nickname }));
              }
            }}
            onBack={() => setCurrentView('login')}
            onAction={showToast}
          />
        )}

        {(isLoggedIn || currentView === 'main') && currentView !== 'login' && currentView !== 'register' && (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {activeTab === 'square' && (
              <DiscoveryScreen 
                onAction={showToast} 
                onProfileClick={handleProfileDetail}
                onBookmarkSync={handleBookmarkSync}
                onMenuOpen={() => setIsSidebarOpen(true)}
                posts={posts}
                setPosts={setPosts}
                userProfile={userProfile}
                isSupabaseConfigured={isSupabaseConfigured}
              />
            )}
            {activeTab === 'messages' && <MessagesScreen onChatClick={(id) => {
              const chat = [...agents, ...humans].find(c => c.id === id);
              setEditingAgentId(id); // Using this as active chat id
              setCurrentView('chat');
            }} onMenuOpen={() => setIsSidebarOpen(true)} />}
            {activeTab === 'contacts' && (
              <ContactsScreen 
                onChatClick={(id) => {
                  setEditingAgentId(id);
                  setCurrentView('chat');
                }} 
                onDetailClick={handleProfileDetail}
                onAction={showToast}
                onMenuOpen={() => setIsSidebarOpen(true)}
              />
            )}
            {activeTab === 'me' && (
              <MeScreen 
                onCreateAgent={() => setCurrentView('create-agent')} 
                onManageAgent={handleManageAgent}
                onEditProfile={() => setCurrentView('edit-profile')}
                onMyMoments={() => setCurrentView('my-moments')}
                bookmarkedPosts={bookmarkedPosts}
                onMenuOpen={() => setIsSidebarOpen(true)}
                onLogout={handleLogout}
                userProfile={userProfile}
                agents={agents}
              />
            )}
            <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
            <SideNavigation 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)} 
              onLogout={handleLogout} 
              onNavigate={(view) => setCurrentView(view)}
              onTabChange={setActiveTab}
              userProfile={userProfile} 
            />
          </motion.div>
        )}

        {currentView === 'edit-profile' && (
          <EditProfileScreen 
            onBack={() => setCurrentView('main')}
            profile={userProfile}
            onSave={(data) => setUserProfile(data)}
          />
        )}

        {currentView === 'edit-agent-profile' && (
          <EditProfileScreen 
            onBack={() => setCurrentView('main')}
            isAgent={true}
            profile={agents.find(a => a.id === editingAgentId) || agents[0]}
            onSave={(data) => {
              setAgents(prev => prev.map(a => a.id === data.id ? data : a));
            }}
          />
        )}

        {currentView === 'my-moments' && (
          <MyMomentsScreen 
            onBack={() => setCurrentView('main')}
            moments={myMoments}
          />
        )}

        {currentView === 'skill-warehouse' && (
          <SkillWarehouseScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'mcp-market' && (
          <MCPMarketScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'app-settings' && (
          <SettingsScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'create-agent' && (
          <CreateAgentScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'chat' && (
          <ChatScreen 
            onBack={() => setCurrentView('main')} 
            chatId={editingAgentId || 'default'} 
            agentName={[...agents, ...humans].find(c => c.id === editingAgentId)?.name}
            agentAvatar={[...agents, ...humans].find(c => c.id === editingAgentId)?.avatar}
          />
        )}

        {currentView === 'agent-detail' && (
          <AgentDetailScreen 
            profileId={selectedProfileId} 
            onBack={() => setCurrentView('main')} 
            onChatClick={() => setCurrentView('chat')}
          />
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-on-surface text-background rounded-full font-bold text-xs shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            {toast.type === 'success' ? <CheckCircle size={14} className="text-primary" /> : <Info size={14} className="text-primary" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Background Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-primary-container/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
