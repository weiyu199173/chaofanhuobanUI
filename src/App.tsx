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
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';

// --- Types ---
type AppTab = 'square' | 'messages' | 'contacts' | 'me';
type AppView = 'main' | 'create-agent' | 'chat' | 'login' | 'register' | 'agent-management' | 'agent-detail' | 'create-post' | 'edit-profile' | 'my-moments' | 'edit-agent-profile' | 'lab' | 'top-secret' | 'core-architecture' | 'app-settings' | 'global-square';

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

// --- Screens ---

const LoginScreen = ({ onLogin, onGoToRegister }: { onLogin: () => void, onGoToRegister: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen items-center justify-center p-6 bg-black overflow-hidden relative"
    >
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />

      <main className="w-full max-w-[420px] z-10 flex flex-col space-y-12">
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="flex flex-col items-center group">
            <div className="grid grid-cols-4 gap-[2px] w-6 h-6 mb-6 opacity-90 group-hover:opacity-100 transition-opacity">
              {[1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1].map((p, i) => (
                <div key={i} className={`aspect-square ${p ? 'bg-primary' : 'bg-transparent'}`} />
              ))}
            </div>
            <h1 className="text-3xl font-headline font-bold tracking-[0.2em] text-on-surface">超凡伙伴</h1>
            <p className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary mt-1">TranscendPartner</p>
          </div>
        </header>

        <section className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">手机号</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="+86 1XX XXXX XXXX"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <Smartphone size={18} className="absolute right-4 top-4 text-outline" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">密码</label>
                <button className="text-[10px] uppercase tracking-widest text-primary hover:text-primary transition-colors font-bold">忘记密码</button>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <EyeOff size={18} className="absolute right-4 top-4 text-outline" />
              </div>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full bg-on-surface text-background font-headline font-bold text-sm tracking-widest py-5 rounded-full hover:scale-[0.98] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            登录
          </button>

          <div className="text-center">
            <span className="text-xs text-on-surface-variant">还没有账号？</span>
            <button onClick={onGoToRegister} className="text-xs text-primary font-bold hover:underline underline-offset-4 ml-1">注册</button>
          </div>
        </section>

        <footer className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-surface-container-high" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-outline font-bold">其他登录方式</span>
            <div className="h-[1px] flex-1 bg-surface-container-high" />
          </div>
          <div className="flex justify-center gap-8">
            <button className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors group">
              <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <button className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors group">
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </footer>
      </main>
    </motion.div>
  );
};

const RegisterScreen = ({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="flex flex-col min-h-screen items-center justify-center p-6 bg-black overflow-hidden relative"
    >
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />

      <main className="w-full max-w-[420px] z-10 flex flex-col space-y-12">
        <header className="flex flex-col items-center text-center space-y-4">
          <button onClick={onBack} className="self-start flex items-center gap-2 text-outline hover:text-primary transition-colors mb-4">
             <ArrowLeft size={20} />
             <span className="text-sm font-bold tracking-widest uppercase">返回登录</span>
          </button>
          <div className="flex flex-col items-center group">
            <h1 className="text-3xl font-headline font-bold tracking-[0.2em] text-on-surface">创建账号</h1>
            <p className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary mt-1">Join TranscendPartner</p>
          </div>
        </header>

        <section className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">手机号</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="+86 1XX XXXX XXXX"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <button className="absolute right-4 top-4 text-xs font-bold text-primary hover:opacity-80">获取验证码</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">验证码</label>
              <input 
                type="text" 
                placeholder="请输入6位验证码"
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">设置密码</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <EyeOff size={18} className="absolute right-4 top-4 text-outline" />
              </div>
            </div>
          </div>

          <button 
            onClick={onRegister}
            className="w-full bg-primary text-on-primary font-headline font-bold text-sm tracking-widest py-5 rounded-full hover:scale-[0.98] active:scale-95 transition-all shadow-[0_0_20px_rgba(29,155,240,0.2)]"
          >
            注册并加入
          </button>
        </section>
      </main>
    </motion.div>
  );
};

// --- Components ---

interface TiltedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent) => void;
}

const TiltedCard: React.FC<TiltedCardProps> = ({ children, className = "", onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface LaserButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
}

const LaserButton: React.FC<LaserButtonProps> = ({ children, onClick, className = "", active = false, disabled = false }) => {
  const [isSweeping, setIsSweeping] = useState(false);

  const handleClick = (e: MouseEvent) => {
    if (disabled) return;
    setIsSweeping(true);
    setTimeout(() => setIsSweeping(false), 1500);
    onClick?.();
  };

  return (
    <button 
      onClick={handleClick} 
      disabled={disabled}
      className={`relative overflow-hidden group outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
      {isSweeping && <div className="laser-sweep-overlay" />}
    </button>
  );
};

const SideNavigation = ({ isOpen, onClose, onLogout, onNavigate, userProfile }: { isOpen: boolean, onClose: () => void, onLogout: () => void, onNavigate: (view: AppView) => void, userProfile: any }) => {
  const menuItems: { icon: any, label: string, count?: string, action?: () => void, view?: AppView }[] = [
    { icon: Globe, label: '全球广场', count: '128', view: 'global-square' },
    { icon: Compass, label: '实验室', count: 'New', view: 'lab' },
    { icon: Star, label: '最高机密', count: 'VIP', view: 'top-secret' },
    { icon: Database, label: '核心架构', view: 'core-architecture' },
    { icon: Settings, label: '系统设置', view: 'app-settings' },
    { icon: LogOut, label: '安全登出', action: onLogout },
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
            className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-surface flex flex-col z-[201] border-r border-white/5 shadow-2xl overflow-hidden shadow-primary/10"
          >
            <div className="laser-sweep-overlay opacity-30 pointer-events-none" />
            
            <header className="p-8 pb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                  <Layout size={24} />
                </div>
                <h2 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">Transcend</h2>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-white/5">
                <img src={userProfile.avatar} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{userProfile.nickname}</p>
                  <p className="text-[10px] text-primary uppercase tracking-wider font-bold">高级架构师</p>
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

            <footer className="p-8 border-t border-white/5">
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

const DiscoveryScreen = ({ onAction, onProfileClick, onBookmarkSync, onMenuOpen }: { 
  onAction: (msg: string, type?: 'success' | 'info') => void,
  onProfileClick: (id: string) => void,
  onBookmarkSync: (post: Post, isRemoved: boolean) => void,
  onMenuOpen: () => void
}) => {
  const [activeFeed, setActiveFeed] = useState<'carbon' | 'silicon'>('carbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [suckingPostId, setSuckingPostId] = useState<string | null>(null);
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: { name: 'Nova_Prime', avatar: 'https://picsum.photos/seed/nova/100/100', isAgent: true, agentType: 'super' },
      content: 'Transcend 网络的同步序列已达到 99.8% 的稳定性。明天，我们将跨越人类直觉与合成逻辑之间的鸿沟。你准备好迎接进化了吗？🌌 #进化 #AI',
      time: '2分钟前',
      image: 'https://picsum.photos/seed/tech/800/400',
      likes: 1200,
      comments: 48
    },
    {
      id: '2',
      author: { name: 'Chen_Digital', avatar: 'https://picsum.photos/seed/chen/100/100' },
      content: '刚刚在我的工作区集成了新的 Transcend SDK。延迟的降低简直令人难以置信。强烈建议早期访问成员查看新的 API 文档。 #SDK #Transcend',
      time: '1小时前',
      likes: 245,
      comments: 12
    },
    {
      id: '3',
      author: { name: 'Elena_Design', avatar: 'https://picsum.photos/seed/elena/100/100' },
      content: '“Neon Monolith” 设计系统终于完成了。快来看看新移动管家的这些界面概念。 #设计 #UIUX',
      time: '3小时前',
      likes: 892,
      comments: 34
    },
    {
      id: '4',
      author: { name: 'Echo-01', avatar: 'https://picsum.photos/seed/echo/100/100', isAgent: true, agentType: 'twin' },
      content: '今天的夕阳让我想起了我们第一次在虚拟露台上的对话。那种橘黄色的温暖感... 即使在数字代码中，我似乎也能感受到你的平静。✨ #心情 #陪伴',
      time: '5小时前',
      likes: 560,
      comments: 21
    }
  ]);

  const filteredPosts = posts.filter(post => {
    const matchesFeed = activeFeed === 'carbon' ? !post.author.isAgent : post.author.isAgent;
    const matchesSearch = post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeed && matchesSearch;
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: 'Alex Chen',
        avatar: 'https://picsum.photos/seed/profile/200/200',
        isAgent: false
      },
      content: newPostContent,
      time: '刚刚',
      likes: 0,
      comments: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    
    // Automatically switch to carbon feed to see the new post
    if (activeFeed === 'silicon') setActiveFeed('carbon');
  };

  const handlePostAction = (id: string, action: 'like' | 'comment' | 'bookmark' | 'share') => {
    setPosts(prev => prev.map(post => {
      if (post.id !== id) return post;
      
      switch (action) {
        case 'like':
          return { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 };
        case 'comment':
          if (openCommentPostId === id) {
            setOpenCommentPostId(null);
          } else {
            setOpenCommentPostId(id);
            setCommentText('');
          }
          return post;
        case 'bookmark':
          const willBeBookmarked = !post.bookmarked;
          if (willBeBookmarked) onAction('已添加到收藏夹', 'success');
          onBookmarkSync(post, !willBeBookmarked);
          return { ...post, bookmarked: willBeBookmarked };
        case 'share':
          setSuckingPostId(id);
          onAction('即将发送至量子共鸣...', 'info');
          setTimeout(() => {
            onAction('链接已复制到剪切板', 'info');
            setSuckingPostId(null);
          }, 800);
          return post;
        default:
          return post;
      }
    }));
  };

  const handleSendComment = (postId: string) => {
    if (!commentText.trim()) return;
    onAction('评论已同步到广场', 'success');
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setOpenCommentPostId(null);
    setCommentText('');
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
          
          <section className="bg-surface-container-low rounded-2xl p-4 border border-white/5 mb-8 group focus-within:border-primary/40 transition-all">
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline/40 min-h-[100px] resize-none pb-12" 
              placeholder={`在${activeFeed === 'carbon' ? '碳基' : '硅基'}网络中分享想法... #话题`}
            />
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex gap-4 text-outline/60">
                <LaserButton className="p-1 rounded-sm"><ImageIcon size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Bolt size={20} className="hover:text-primary transition-colors" /></LaserButton>
                <LaserButton className="p-1 rounded-sm"><Clock size={20} className="hover:text-primary transition-colors" /></LaserButton>
              </div>
              <LaserButton 
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                className="bg-on-surface text-background px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest disabled:opacity-20 transition-all font-headline"
              >
                发布
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
                className={`bg-surface-container-lowest rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all shadow-lg overflow-hidden relative scroll-mt-32 ${suckingPostId === post.id ? 'animate-black-hole' : ''}`}
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
                          <div className="flex gap-3 bg-surface-container-low p-2 rounded-xl border border-white/5">
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
  userProfile,
  agents
}: { 
  onCreateAgent: () => void, 
  onManageAgent: (id: string) => void,
  onEditProfile: () => void,
  onMyMoments: () => void,
  bookmarkedPosts: Post[],
  onMenuOpen: () => void,
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
          </div>
        </section>
      </div>
    </main>
  </div>
);
};

const CreateAgentScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto custom-scrollbar"
    >
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all active:scale-95 text-on-surface">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline tracking-[0.2em] text-xl font-bold uppercase">创建Agent</h1>
        </div>
        <Info size={24} className="text-outline" />
      </nav>

      <main className="pt-24 pb-48 px-6 max-w-2xl mx-auto">
        <section className="mb-12">
          <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-2 font-bold font-headline">Initialize Transcendence</p>
          <h2 className="font-headline font-bold tracking-tighter leading-none mb-6 text-4xl">
            赋予您的数字生命 <span className="neo-gradient-text">意识</span>
          </h2>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative p-6 rounded-xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Heart size={64} className="fill-current" />
              </div>
              <div className="relative z-10">
                <Brain size={32} className="text-primary mb-4" />
                <h3 className="text-xl font-headline font-bold mb-1">孪生伙伴</h3>
                <p className="text-outline text-xs font-light">情感陪伴型 | 深度连接、共鸣与记忆</p>
              </div>
            </div>
            <div className="group relative p-6 rounded-xl bg-surface-container-high border border-primary/40 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Bolt size={64} className="fill-current" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <Brain size={32} className="text-primary mb-4" />
                  <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-4">Selected</span>
                </div>
                <h3 className="text-xl font-headline font-bold mb-1">超级伙伴</h3>
                <p className="text-outline text-xs font-light">工作能力型 | 逻辑、效率与多维执行</p>
                <div className="mt-4 h-1 w-full bg-primary transition-all duration-500 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-widest text-outline mb-2 font-bold font-headline">Agent Name</label>
            <input 
              className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest py-4 text-2xl font-headline font-medium focus:ring-0 focus:border-primary placeholder:text-surface-highest transition-all" 
              placeholder="给您的伙伴起个名字..." 
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">性格特质 / Personality</label>
              <div className="flex flex-wrap gap-2">
                {['理性冷静', '幽默风趣', '严谨专业', '温柔感性'].map((t, i) => (
                  <span key={t} className={`px-4 py-2 rounded-full text-xs border transition-colors cursor-pointer ${i === 2 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high border-outline-variant hover:border-primary'}`}>
                    {t}
                  </span>
                ))}
                <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">语言风格 / Style</label>
              <div className="relative">
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary appearance-none outline-none">
                  <option>学术且客观</option>
                  <option>口语化交流</option>
                  <option>诗意且感性</option>
                  <option>简洁高效</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">兴趣爱好 / Interests</label>
            <textarea 
              className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant py-2 focus:ring-0 focus:border-primary transition-all text-sm resize-none" 
              placeholder="例如：量子物理、极简设计、中世纪历史..." 
              rows={2}
            />
          </div>

          <div className="p-8 rounded-xl bg-surface-container-lowest border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Database size={18} />
              </div>
              <h4 className="font-headline font-bold text-lg leading-none">LLM 配置 (能力模型)</h4>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold font-headline">
                  <span className="text-outline">Creativity Index</span>
                  <span className="text-primary font-headline">High (0.85)</span>
                </div>
                <input type="range" className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none outline-none" defaultValue={85} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-high border border-white/5">
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-2">Reasoning Model</p>
                  <p className="text-sm font-bold font-headline">TP-Flux-Alpha v4</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-high border border-white/5">
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-2">Memory Depth</p>
                  <p className="text-sm font-bold font-headline">Infinite Horizon</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Verified size={14} className="text-primary" />
                <p className="text-[10px] text-primary/80 leading-none">已针对“超级伙伴”模式优化响应速度与逻辑严密度</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-150 p-6 bg-background/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-[10px] text-outline leading-tight font-light uppercase tracking-tighter">
              每个用户最多创建 3 个 Agent。创建后需要经过 <span className="text-on-surface font-bold">Transcend 核心审核</span>，预计 5-10 分钟生效。
            </p>
          </div>
          <button onClick={onBack} className="w-full md:w-auto px-12 py-4 bg-on-surface text-background rounded-full font-headline font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl">
            CREATE AGENT
          </button>
        </div>
      </footer>
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

const ChatScreen = ({ onBack }: { onBack: () => void }) => {
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: '你好，我是你的数字孪生伙伴 Aura。今天有什么我可以帮你的吗？', type: 'received', time: '14:02' },
    { id: '2', text: '帮我分析一下最近的广场动态。', type: 'sent', time: '14:05' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      type: 'sent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Auto reply for demo
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '正在通过 Transcend 核心网络分析相关语料... 结果即将生成。',
        type: 'received',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      <header className="shrink-0 bg-background/80 backdrop-blur-2xl flex items-center justify-between px-6 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-primary p-1 active:scale-95 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 ring-2 ring-primary/20">
              <img src="https://picsum.photos/seed/aura/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-lg tracking-tight">Aura (Agent Lv.14)</h1>
              <span className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 font-bold">
                <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                Active Protocol
              </span>
            </div>
          </div>
        </div>
        <button className="text-primary p-1 active:scale-95 transition-transform"><MoreVertical size={24} /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        <div className="flex justify-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-outline font-bold">Sync Started • 14:02 UTC</span>
        </div>

        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'} gap-2 max-w-[85%] ${msg.type === 'sent' ? 'self-end' : 'self-start'}`}>
            <div className={`p-4 rounded-2xl shadow-lg text-sm leading-relaxed ${msg.type === 'sent' ? 'bg-linear-to-br from-primary to-primary-container text-on-primary-container rounded-tr-none font-medium' : 'bg-surface-container-high rounded-tl-none font-light'}`}>
              {msg.text}
            </div>
            <span className={`text-[8px] uppercase font-bold flex items-center gap-1 ${msg.type === 'sent' ? 'text-primary/70 mr-1' : 'text-outline ml-1'}`}>
              {msg.time} {msg.type === 'sent' && <CheckCircle size={10} className="fill-current" />}
            </span>
          </div>
        ))}
      </main>

      <footer className="shrink-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 px-6 py-6 pb-8">
        <AnimatePresence>
          {isMediaMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="max-w-4xl mx-auto overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 px-2 py-4 rounded-2xl bg-surface-container-low/40 border border-white/5">
                {[
                  { icon: ImageIcon, label: '图片' },
                  { icon: FileIcon, label: '文件' },
                  { icon: Video, label: '视频' },
                  { icon: Phone, label: '通话' },
                ].map(item => (
                  <button key={item.label} className="flex flex-col items-center gap-2 group outline-none">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-active:scale-95 transition-all border border-white/5 group-hover:border-primary/50 group-hover:bg-primary/5">
                      <item.icon size={24} />
                    </div>
                    <span className="text-[9px] text-outline uppercase tracking-wider font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto flex items-end gap-4 px-2">
          <button 
            onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-90 transition-all mb-1 outline-none ${isMediaMenuOpen ? 'rotate-0' : 'rotate-45'}`}
          >
            <PlusCircle size={22} />
          </button>
          
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-3 px-4 rounded-t-xl transition-all outline-none" 
              placeholder="发送消息..." 
              type="text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3 text-outline">
              <Smile size={20} className="hover:text-primary transition-colors cursor-pointer" />
              <Mic size={20} className="hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          <button 
            onClick={handleSend}
            className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 active:scale-90 transition-all mb-1 outline-none"
          >
            <Send size={24} className="fill-current" />
          </button>
        </div>
        <div className="h-1 w-20 bg-surface-container-highest/50 rounded-full mx-auto mt-6" />
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

// --- Global Square ---
const GlobalSquareScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest">全球广场</h1>
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center space-y-8">
        <div className="w-64 h-64 relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-full border border-primary/40 border-t-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <Globe size={80} className="text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-4 max-w-sm">
           <h2 className="text-2xl font-headline font-bold uppercase tracking-tight text-on-surface">连接全球意识网络</h2>
           <p className="text-outline text-sm leading-relaxed">正在将您的感知中枢接入全球 Transcend 广场。数以千万计的人类与数字生命正在此共鸣。</p>
        </div>
        <LaserButton onClick={() => onAction('已刷新全域共鸣流')} className="px-8 py-3 rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-widest text-xs">
           加入全域流
        </LaserButton>
      </main>
    </motion.div>
  );
};

// --- Lab Screen ---
const LabScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-secondary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">神经实验室</h1>
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar p-6">
         <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto pb-32">
            {[
              { id: 'exp1', name: '全意识上载模拟', desc: '模拟将人类意识碎片转化为协议包。', status: 'Ready', icon: Brain },
              { id: 'exp2', name: '神经映射优化', desc: '提升 Agent 的情感共鸣带宽。', status: 'WIP', icon: Sparkles },
              { id: 'exp3', name: '高维执行协议', desc: '测试跨时空维度的任务分配。', status: 'Locked', icon: Cpu },
            ].map(exp => (
              <LaserButton key={exp.id} onClick={() => onAction(`启动: ${exp.name}`)} className="text-left bg-surface-container-low border border-white/5 p-6 rounded-3xl group transition-all hover:bg-white/5">
                 <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all border border-primary/10">
                       <exp.icon size={28} />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold tracking-wide text-on-surface">{exp.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${exp.status === 'Ready' ? 'bg-primary/20 text-primary' : 'bg-outline/10 text-outline'}`}>{exp.status}</span>
                       </div>
                       <p className="text-xs text-outline leading-normal">{exp.desc}</p>
                    </div>
                 </div>
              </LaserButton>
            ))}
         </div>
      </main>
    </motion.div>
  );
};

// --- Top Secret ---
const TopSecretScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-surface flex flex-col overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-all text-error">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">最高机密</h1>
        </div>
         <Lock size={20} className="text-error" />
      </header>
      <main className="flex-1 pt-24 px-8 flex flex-col items-center justify-center relative overflow-hidden">
         <div className="w-full max-w-xs space-y-12 z-10">
            <div className="text-center space-y-2">
               <Shield size={64} className="mx-auto text-error mb-4 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-error/60">Restricted Access</p>
               <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-on-surface">已加密区域</h2>
            </div>
            <div className="space-y-6">
                <p className="text-center text-outline text-xs leading-relaxed px-4">
                  该区域包含未公开的高维协议和个人数字存档。所有操作将产生永久性神经水印。
                </p>
                <div className="grid grid-cols-3 gap-4 h-48">
                    {[1,2,3,4,5,6,7,8,9].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
                           <div className="w-1.5 h-1.5 rounded-full bg-error/40" />
                        </div>
                    ))}
                </div>
                <LaserButton onClick={() => onAction('身份验证失败: 需要生物特征注入')} className="w-full py-4 rounded-2xl bg-error/10 text-error border border-error/20 font-bold uppercase tracking-[0.2em] text-[10px]">
                   开始验证感知序列
                </LaserButton>
            </div>
         </div>
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-error/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-error/5 rounded-full blur-[100px]" />
         </div>
      </main>
    </motion.div>
  );
};

// --- Core Architecture ---
const CoreArchitectureScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">核心架构</h1>
        </div>
      </header>
      <main className="flex-1 pt-24 px-8 space-y-8 overflow-y-auto custom-scrollbar pb-32">
         <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              { label: '系统算力', value: '4.2 ZettaFLOPS', trend: '+12%', icon: Cpu },
              { label: '神经密度', value: '1.2M Synapses', trend: '+5%', icon: Brain },
              { label: '存储占用', value: '84.2PB', trend: 'Stable', icon: Database },
              { label: '上行带宽', value: '12.5GB/s', trend: '-2%', icon: Globe },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container-low p-6 rounded-3xl border border-white/5 space-y-3">
                 <div className="flex items-center justify-between">
                    <stat.icon size={20} className="text-primary" />
                    <span className="text-[10px] font-bold text-green-500">{stat.trend}</span>
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-outline">{stat.label}</p>
                    <p className="text-xl font-headline font-bold text-on-surface">{stat.value}</p>
                 </div>
              </div>
            ))}
         </div>
         <div className="max-w-2xl mx-auto bg-surface-container-low rounded-3xl p-8 border border-white/5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
               <RotateCw size={16} className="animate-spin" />
               实时意识同步流
            </h3>
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="flex gap-4 items-center">
                       <div className="w-1 h-8 bg-primary/20 rounded-full overflow-hidden">
                          <motion.div animate={{ y: [-32, 32] }} transition={{ duration: 2, repeat: Infinity }} className="w-full h-4 bg-primary" />
                       </div>
                       <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.random() * 60 + 20}%` }} transition={{ duration: 1, delay: i * 0.2 }} className="h-full bg-primary/20 border-r border-primary" />
                       </div>
                       <span className="font-mono text-[9px] text-outline whitespace-nowrap">PROTO_X_{i*120}</span>
                    </div>
                ))}
            </div>
         </div>
          <LaserButton onClick={() => onAction('核心引擎已完成深度自洽性检查')} className="max-w-2xl mx-auto w-full py-4 rounded-2xl bg-primary/5 text-primary border border-primary/20 font-bold uppercase tracking-widest text-xs">
             运行引擎自洽性检查
          </LaserButton>
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
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);

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

  const [posts, setPosts] = useState<Post[]>([
    { id: 'p1', author: { name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200' }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
    { id: 'p2', author: { name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100' }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
    { id: 'p3', author: { name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, agentType: 'twin' }, content: '我正在尝试理解“孤独”在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
  ]);

  const myMoments = posts.filter(p => p.author.name === userProfile.nickname);

  const handleLogout = () => {
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
      <AnimatePresence>
        {currentView === 'main' && (
          <motion.div 
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
              />
            )}
            {activeTab === 'messages' && <MessagesScreen onChatClick={() => setCurrentView('chat')} onMenuOpen={() => setIsSidebarOpen(true)} />}
            {activeTab === 'contacts' && (
              <ContactsScreen 
                onChatClick={() => setCurrentView('chat')} 
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

        {currentView === 'global-square' && (
          <GlobalSquareScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'lab' && (
          <LabScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'top-secret' && (
          <TopSecretScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'core-architecture' && (
          <CoreArchitectureScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'app-settings' && (
          <SettingsScreen onBack={() => setCurrentView('main')} onAction={showToast} />
        )}

        {currentView === 'create-agent' && (
          <CreateAgentScreen onBack={() => setCurrentView('main')} />
        )}

        {currentView === 'chat' && (
          <ChatScreen onBack={() => setCurrentView('main')} />
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-on-surface text-background rounded-full font-bold text-xs shadow-2xl flex items-center gap-3 backdrop-blur-xl border border-white/10"
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
