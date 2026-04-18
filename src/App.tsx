/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Shared and Layout
import { AppTab, AppView, Post, Agent } from './types';
import { BottomNavBar, SideNavigation } from './components/layout/Navigation';

// Core Flow Screens
import { LoginScreen } from './components/auth/LoginScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';

// Main App Screens
import { DiscoveryScreen } from './components/screens/DiscoveryScreen';
import { MessagesScreen } from './components/screens/MessagesScreen';
import { ContactsScreen } from './components/screens/ContactsScreen';
import { MeScreen } from './components/screens/MeScreen';

// Deeper Modules
import { AgentDetailScreen, CreateAgentScreen } from './components/screens/AgentScreens';
import { EditProfileScreen, MyMomentsScreen, SkillWarehouseScreen, MCPMarketScreen, SettingsScreen } from './components/screens/SettingsScreens';
import { ChatScreen } from './components/screens/ChatScreen';

import { mockProfiles } from './data/mockProfiles';
import { Storage } from './utils/storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('square');
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  
  // 从本地存储初始化状态
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>(() => {
    return Storage.getBookmarkedPosts();
  });
  const [allContacts, setAllContacts] = useState<any[]>(() => {
    const savedContacts = Storage.getContacts();
    return savedContacts.length > 0 ? savedContacts : mockProfiles;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = Storage.getPosts();
    if (savedPosts.length > 0) {
      return savedPosts;
    }
    return [
      { id: 'p1', author: { id: 'h5', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
      { id: 'p2', author: { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
      { id: 'p3', author: { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true, agentType: 'twin' }, content: '我正在尝试理解"孤独"在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
      { id: 'p4', author: { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', isAgent: false }, content: '极简设计的哲学在于减法的艺术，每一个像素都应该有其存在的理由。', time: '12小时前', likes: 72, comments: 8 },
    ];
  });

  // 持久化用户资料
  useEffect(() => {
    Storage.saveUserProfile(userProfile);
  }, [userProfile]);

  // 持久化联系人
  useEffect(() => {
    Storage.saveContacts(allContacts);
  }, [allContacts]);

  // 持久化帖子
  useEffect(() => {
    Storage.savePosts(posts);
  }, [posts]);

  // 持久化收藏的帖子
  useEffect(() => {
    Storage.saveBookmarkedPosts(bookmarkedPosts);
  }, [bookmarkedPosts]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
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
    };

    fetchPosts();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        if (session.user.user_metadata?.nickname) {
          setUserProfile(prev => ({ ...prev, nickname: session.user.user_metadata.nickname }));
        }
      }
    });

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
        Storage.clearAll();
        setIsLoggedIn(false);
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
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

  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = Storage.getUserProfile();
    if (savedProfile) {
      return savedProfile;
    }
    return {
      id: 'h5', // 与 mockProfiles 保持一致
      uid: 'transcend-user-001', // 唯一用户 ID
      nickname: 'Alex Chen',
      avatar: 'https://picsum.photos/seed/profile/200/200',
      gender: '男',
      bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
      phone: '138 8888 0000',
      accountId: 'Transcend#001',
      region: '上海，静安',
      isAgent: false,
      type: 'human' as const
    };
  });

  const agents = allContacts.filter(c => c.isAgent);
  
  // 好友功能状态
  const [friends, setFriends] = useState<ContactProfile[]>(allContacts.filter(c => c.isFriend));

  const myMoments = posts.filter(p => p.author.name === userProfile.nickname);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsLoggedIn(false);
    setCurrentView('login');
    setIsSidebarOpen(false);
  };

  // 添加好友
  const handleAddFriend = (profileId: string) => {
    const profile = allContacts.find(c => c.id === profileId);
    if (profile) {
      const updatedContacts = allContacts.map(c => 
        c.id === profileId ? { ...c, isFriend: true } : c
      );
      setAllContacts(updatedContacts);
      setFriends(updatedContacts.filter(c => c.isFriend));
    }
  };

  // 移除好友
  const handleRemoveFriend = (profileId: string) => {
    const updatedContacts = allContacts.map(c => 
      c.id === profileId ? { ...c, isFriend: false } : c
    );
    setAllContacts(updatedContacts);
    setFriends(updatedContacts.filter(c => c.isFriend));
  };

  // 检查是否是好友
  const isFriend = (profileId: string) => {
    return friends.some(f => f.id === profileId);
  };

  const handleProfileDetail = (id: string) => {
    if (id === 'me') {
      setActiveTab('me');
    } else {
      // 检查是否存在该 ID 的用户，如果不存在，尝试从帖子中查找并创建
      let existingProfile = allContacts.find(p => p.id === id);
      if (!existingProfile) {
        // 从帖子中查找作者信息
        const post = posts.find(p => p.author.id === id);
        if (post) {
          // 创建临时用户资料
          const tempProfile = {
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
          setAllContacts([...allContacts, tempProfile]);
        }
      }
      
      setSelectedProfileId(id);
      setCurrentView('agent-detail');
    }
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
                userProfile={userProfile}
                agents={allContacts}
                onCreatePost={(post) => setPosts(prev => [post, ...prev])}
                onUpdatePost={(updatedPost) => setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p))}
                onDeletePost={async (id) => {
                  // 1. 乐观更新 UI
                  setPosts(prev => prev.filter(p => p.id !== id));
                  
                  // 2. 同步到数据库
                  if (isSupabaseConfigured) {
                    try {
                      const { error } = await supabase.from('posts').delete().eq('id', id);
                      if (error) {
                        console.error('删除帖子失败:', error);
                        showToast('删除失败: ' + error.message, 'info');
                        // 如果数据库删除失败，恢复 UI
                        // 注意：这里需要重新获取帖子列表或者有备份数据
                      } else {
                        showToast('帖子已删除', 'success');
                      }
                    } catch (err) {
                      console.error('删除帖子出错:', err);
                      showToast('删除出错，请稍后重试', 'info');
                    }
                  }
                }}
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
                  onSave={(data) => {
                    setUserProfile(data);
                    // 同步更新 allContacts 中的用户信息
                    setAllContacts(prev => prev.map(contact => 
                      contact.id === data.id ? {...contact, ...data} : contact
                    ));
                    showToast('个人资料已更新', 'success');
                  }}
                />
              )}

        {currentView === 'edit-agent-profile' && (
          <EditProfileScreen 
            onBack={() => setCurrentView('main')}
            isAgent={true}
            profile={agents.find(a => a.id === editingAgentId) || agents[0]}
            onSave={(data) => {
              setAllContacts(prev => prev.map(a => a.id === data.id ? data : a));
            }}
          />
        )}

        {currentView === 'my-moments' && (
          <MyMomentsScreen 
            onBack={() => setCurrentView('main')}
            moments={myMoments}
            onDeleteMoment={async (id) => {
              // 1. 乐观更新 UI
              setPosts(prev => prev.filter(p => p.id !== id));
              
              // 2. 同步到数据库
              if (isSupabaseConfigured) {
                try {
                  const { error } = await supabase.from('posts').delete().eq('id', id);
                  if (error) {
                    console.error('删除动态失败:', error);
                    showToast('删除失败: ' + error.message, 'info');
                  } else {
                    showToast('动态已删除', 'success');
                  }
                } catch (err) {
                  console.error('删除动态出错:', err);
                  showToast('删除出错，请稍后重试', 'info');
                }
              } else {
                showToast('动态已删除', 'success');
              }
            }}
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
