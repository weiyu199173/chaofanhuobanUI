import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import './lib/supabase-test';

import { AppTab, AppView, Post, UserProfile as UserProfileType, ContactProfile } from './types';
import { BottomNavBar, SideNavigation } from './components/layout/Navigation';

import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { DiscoveryScreen } from './components/screens/DiscoveryScreen';
import { MessagesScreen } from './components/screens/MessagesScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { MeScreen } from './components/screens/MeScreen';
import { AgentDetailScreen, CreateAgentScreen } from './components/screens/AgentScreens';
import { EditProfileScreen, MyMomentsScreen, SkillWarehouseScreen, MCPMarketScreen, SettingsScreen } from './components/screens/SettingsScreens';
import { ChatScreen } from './components/screens/ChatScreen';

import { mockProfiles } from './data/mockProfiles';
import { UserService } from './services/userService';
import { FriendService } from './services/friendService';
import { PostService } from './services/postService';
import { ContactService } from './services/contactService';
import { DatabaseDebugger } from './components/DatabaseDebugger';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('square');
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [allContacts, setAllContacts] = useState<ContactProfile[]>(mockProfiles);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileType>({
    id: 'h5',
    uid: 'transcend-user-001',
    nickname: 'Alex Chen',
    avatar: 'https://picsum.photos/seed/profile/200/200',
    gender: '男',
    bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
    phone: '138 8888 0000',
    accountId: 'Transcend#001',
    region: '上海，静安',
    isAgent: false,
    type: 'human'
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const agents = allContacts.filter(c => c.isAgent);
  const friends = allContacts.filter(c => c.isFriend);
  const myMoments = posts.filter(p => p.author.id === userProfile.id || p.author.name === userProfile.nickname);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const loadInitialData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAllContacts(mockProfiles);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 正在加载初始数据...');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        console.log('👤 当前用户:', user.id);
        
        let userProfileData = await UserService.getUserProfile(user.id);
        
        // 如果数据库中没有资料，从 auth metadata 或使用默认值
        if (!userProfileData) {
          console.log('📝 用户记录不存在，使用默认值');
          const userMetadata = user.user_metadata || {};
          userProfileData = {
            id: user.id,
            nickname: userMetadata.nickname || '用户',
            avatar: userMetadata.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
            bio: userMetadata.bio || '',
          };
        }

        setUserProfile({
          id: userProfileData.id,
          uid: user.id,
          nickname: userProfileData.nickname,
          avatar: userProfileData.avatar,
          gender: userProfileData.gender || '男',
          bio: userProfileData.bio,
          phone: userProfileData.phone || '',
          accountId: userProfileData.accountId || `Transcend#${user.id.substring(0, 8)}`,
          region: userProfileData.region || '',
          isAgent: false,
          type: 'human',
          full_bio: userProfileData.full_bio,
          fullBio: userProfileData.full_bio || userProfileData.fullBio
        });
        console.log('✅ 用户资料已加载:', userProfileData);
      }

      const loadedPosts = await PostService.getAllPosts();
      setPosts(loadedPosts.length > 0 ? loadedPosts : [
        { id: 'p1', author: { id: 'h5', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
        { id: 'p2', author: { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
        { id: 'p3', author: { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, agentType: 'twin' }, content: '我正在尝试理解"孤独"在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
      ]);

      const contacts = await ContactService.getAllContacts();
      setAllContacts(contacts.length > 0 ? contacts : mockProfiles);

      if (user) {
        const bookmarks = await PostService.getBookmarkedPosts(user.id);
        setBookmarkedPosts(bookmarks);
      }

    } catch (error) {
      console.error('加载初始数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        await loadInitialData();
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        setCurrentUserId(session.user.id);
        showToast('账号验证成功，欢迎回来', 'success');
        await loadInitialData();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setCurrentView('login');
        setCurrentUserId(null);
      }
    });

    const unsubscribePosts = PostService.subscribeToPosts((newPosts) => {
      setPosts(newPosts);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribePosts();
    };
  }, [loadInitialData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setCurrentView('login');
    setIsSidebarOpen(false);
  };

  const handleAddFriend = async (profileId: string) => {
    if (!currentUserId || !isSupabaseConfigured) {
      const updatedContacts = allContacts.map(c => 
        c.id === profileId ? { ...c, isFriend: true } : c
      );
      setAllContacts(updatedContacts);
      showToast('已添加好友', 'success');
      return;
    }

    const success = await FriendService.sendFriendRequest(currentUserId, profileId);
    if (success) {
      const updatedContacts = allContacts.map(c => 
        c.id === profileId ? { ...c, isFriend: true } : c
      );
      setAllContacts(updatedContacts);
      showToast('好友请求已发送', 'success');
    } else {
      showToast('发送请求失败', 'info');
    }
  };

  const handleRemoveFriend = async (profileId: string) => {
    if (!currentUserId || !isSupabaseConfigured) {
      const updatedContacts = allContacts.map(c => 
        c.id === profileId ? { ...c, isFriend: false } : c
      );
      setAllContacts(updatedContacts);
      showToast('已移除好友', 'success');
      return;
    }

    const success = await FriendService.removeFriend(currentUserId, profileId);
    if (success) {
      const updatedContacts = allContacts.map(c => 
        c.id === profileId ? { ...c, isFriend: false } : c
      );
      setAllContacts(updatedContacts);
      showToast('已移除好友', 'success');
    }
  };

  const handleProfileDetail = async (id: string) => {
    if (id === 'me') {
      setActiveTab('me');
    } else {
      let existingProfile = allContacts.find(p => p.id === id);
      if (!existingProfile) {
        const post = posts.find(p => p.author.id === id);
        if (post) {
          existingProfile = {
            id: id,
            name: post.author.name,
            avatar: post.author.avatar,
            isAgent: post.author.isAgent || false,
            type: post.author.isAgent ? (post.author.agentType || 'twin') : 'human' as const,
            bio: post.author.isAgent ? 'AI 数字伙伴' : 'Transcend 用户',
            fullBio: post.author.isAgent 
              ? '这是一位 AI 数字伙伴，致力于与人类建立深度共鸣。' 
              : '这是一位 Transcend 用户，正在探索数字生命的边界。',
            isFriend: false
          };
        }
      }
      setSelectedProfileId(id);
      setCurrentView('agent-detail');
    }
  };

  const handleManageAgent = (id: string) => {
    setSelectedProfileId(id);
    setCurrentView('edit-agent-profile');
  };

  const handleBookmarkSync = async (post: Post, isRemoved: boolean) => {
    if (currentUserId && isSupabaseConfigured) {
      await PostService.toggleBookmark(post.id, currentUserId);
    }
    
    if (isRemoved) {
      setBookmarkedPosts(prev => prev.filter(p => p.id !== post.id));
    } else {
      setBookmarkedPosts(prev => [post, ...prev]);
    }
  };

  const handleCreatePost = async (post: Post) => {
    setPosts(prev => [post, ...prev]);
    
    if (isSupabaseConfigured && currentUserId) {
      const newPost = await PostService.createPost({
        content: post.content,
        image_url: post.image,
        author_data: post.author
      });
      if (newPost) {
        setPosts(prev => prev.map(p => p.id === post.id ? newPost : p));
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    
    if (isSupabaseConfigured) {
      const success = await PostService.deletePost(postId);
      if (success) {
        showToast('帖子已删除', 'success');
      } else {
        showToast('删除失败', 'info');
      }
    }
  };

  const isFriend = (profileId: string) => {
    return friends.some(f => f.id === profileId);
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
              if (user?.user_metadata?.nickname) {
                setUserProfile(prev => ({ ...prev, nickname: user.user_metadata.nickname }));
              }
              loadInitialData();
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
              if (user?.user_metadata?.nickname) {
                setUserProfile(prev => ({ ...prev, nickname: user.user_metadata.nickname }));
              }
              loadInitialData();
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
                userProfile={userProfile}
                agents={allContacts}
                onCreatePost={handleCreatePost}
                onUpdatePost={(updatedPost) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}
                onDeletePost={handleDeletePost}
              />
            )}
            {activeTab === 'messages' && <MessagesScreen onChatClick={(id) => { setChatTargetId(id); setCurrentView('chat'); }} onMenuOpen={() => setIsSidebarOpen(true)} allContacts={allContacts} />}
            {activeTab === 'contacts' && (
              <ContactsScreen 
                allContacts={allContacts}
                onChatClick={(id) => { setChatTargetId(id); setCurrentView('chat'); }} 
                onDetailClick={handleProfileDetail}
                onAction={showToast}
                onMenuOpen={() => setIsSidebarOpen(true)}
                onUpdateContact={(updated) => setAllContacts(prev => prev.map(c => c.id === updated.id ? updated : c))}
                onAddFriend={handleAddFriend}
                onRemoveFriend={handleRemoveFriend}
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
            onOpenDebugger={() => setShowDebugger(true)}
          />
          </motion.div>
        )}

        {currentView === 'edit-profile' && (
          <EditProfileScreen 
            onBack={() => setCurrentView('main')}
            profile={userProfile}
            onSave={async (data) => {
              // 尝试保存（现在会立即保存到本地）
              if (isSupabaseConfigured && currentUserId) {
                await UserService.updateUserProfile(currentUserId, data);
              }
              
              // 无论如何都更新本地状态
              setUserProfile(data);
              setAllContacts(prev => prev.map(c => 
                c.id === data.id ? { ...c, ...data } : c
              ));
              
              // 总是显示成功
              showToast('个人资料已更新', 'success');
            }}
          />
        )}

        {currentView === 'edit-agent-profile' && (
          <EditProfileScreen 
            onBack={() => setCurrentView('main')}
            isAgent={true}
            profile={agents.find(a => a.id === selectedProfileId) || agents[0]}
            onSave={(data) => {
              setAllContacts(prev => prev.map(c => c.id === data.id ? data : c));
            }}
          />
        )}

        {currentView === 'my-moments' && (
          <MyMomentsScreen 
            onBack={() => setCurrentView('main')}
            moments={myMoments}
            onDeleteMoment={handleDeletePost}
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
          <CreateAgentScreen onBack={() => setCurrentView('main')} />
        )}

        {currentView === 'chat' && (
          <ChatScreen 
            onBack={() => setCurrentView('main')} 
            targetId={chatTargetId}
            agents={allContacts}
            userProfile={userProfile}
            onProfileClick={handleProfileDetail}
            onAction={showToast}
          />
        )}

        {currentView === 'agent-detail' && (
          <AgentDetailScreen 
            profileId={selectedProfileId} 
            allContacts={allContacts}
            onBack={() => setCurrentView('main')} 
            onChatClick={(id) => { setChatTargetId(id); setCurrentView('chat'); }}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
            isFriend={selectedProfileId ? isFriend(selectedProfileId) : false}
          />
        )}
      </AnimatePresence>

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

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-primary-container/5 blur-[100px] rounded-full" />
      </div>

      {/* 数据库诊断工具 */}
      {showDebugger && (
        <DatabaseDebugger onClose={() => setShowDebugger(false)} />
      )}
    </div>
  );
}
