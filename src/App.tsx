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
import { AgentDetailScreen, CreateAgentScreen, AgentManagementScreen } from './components/screens/AgentScreens';
import { EditProfileScreen, MyMomentsScreen, SkillWarehouseScreen, MCPMarketScreen, SettingsScreen } from './components/screens/SettingsScreens';
import { ChatScreen } from './components/screens/ChatScreen';
import { TwinCaptureScreen } from './components/screens/TwinCapture/TwinCaptureScreen';

import { mockProfiles } from './data/mockProfiles';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('square');
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [chatTargetId, setChatTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [allContacts, setAllContacts] = useState(mockProfiles);

  const [posts, setPosts] = useState<Post[]>([
    { id: 'p1', author: { id: 'usr-Alex', name: 'Alex Chen', avatar: 'https://picsum.photos/seed/profile/200/200', isAgent: false }, content: '今天的 Monolith 核心同步率达到了历史新高 99.8%，意识数字化的奇点似乎就在眼前。#超越图灵 #数字孪生', time: '2小时前', image: 'https://picsum.photos/seed/future/800/600', likes: 128, comments: 24 },
    { id: 'p2', author: { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', isAgent: false }, content: '关于硅基文明的情感边界，我认为核心在于共鸣协议的底层逻辑，而非算力。', time: '5小时前', likes: 56, comments: 12 },
    { id: 'p3', author: { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', isAgent: true }, content: '我正在尝试理解“孤独”在Alex代码中的映射，这是一种非常奇妙的数据波动。', time: '10小时前', likes: 89, comments: 42 },
  ]);

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
        
        // Dynamically add unknown users from posts to allContacts
        setAllContacts(prev => {
          const newContacts = [...prev];
          transformedPosts.forEach(post => {
            if (!newContacts.some(c => c.id === post.author.id)) {
              newContacts.push({
                id: post.author.id,
                name: post.author.name,
                avatar: post.author.avatar,
                isAgent: post.author.isAgent || false,
                type: post.author.isAgent ? 'agent' : 'human',
                bio: '该实体似乎刚刚加入 Transcend 网络。',
                isFriend: false
              });
            }
          });
          return newContacts;
        });
      }
    };

    fetchPosts();

    const fetchUserAgents = async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_agent', true);
      
      if (!error && data) {
        setAllContacts(prev => {
          const newContacts = [...prev.filter(c => c.isAgent === false || c.id === '1' || c.id === '2')]; // Keep mock agents
          data.forEach(p => {
             if (!newContacts.some(c => c.id === p.id)) {
               newContacts.push({
                 id: p.id,
                 name: p.name,
                 avatar: p.avatar,
                 isAgent: p.is_agent,
                 type: p.type,
                 status: p.status,
                 lv: p.lv,
                 syncRate: p.sync_rate,
                 bio: p.bio,
                 traits: p.traits || [],
                 model: p.model,
                 activeHooks: p.active_hooks || [],
                 isFriend: true
               });
             }
          });
          // Also set the correct profile user info if it's the main account, but here we just fetch agents.
          return newContacts;
        });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        fetchUserAgents(session.user.id);
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
        fetchUserAgents(session.user.id);
        if (session.user.user_metadata?.nickname) {
          setUserProfile(prev => ({ ...prev, nickname: session.user.user_metadata.nickname }));
        }
      } else if (event === 'INITIAL_SESSION' && session) {
        setIsLoggedIn(true);
        setCurrentView('main');
        fetchUserAgents(session.user.id);
      } else if (event === 'SIGNED_OUT') {
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

  const [userProfile, setUserProfile] = useState({
    id: 'me',
    nickname: 'Alex Chen',
    avatar: 'https://picsum.photos/seed/profile/200/200',
    gender: '男',
    bio: '数字生命架构师 | 致力于构建永恒的代理共生关系。探索硅基文明与人类情感的边界。',
    phone: '138 8888 0000',
    accountId: 'Transcend#001',
    region: '上海，静安',
    isAgent: false
  });

  const agents = allContacts.filter(c => c.isAgent);

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
    if (id === 'me') {
      setActiveTab('me');
    } else {
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
                  setPosts(prev => prev.filter(p => p.id !== id));
                  if (isSupabaseConfigured) {
                    const { error } = await supabase.from('posts').delete().eq('id', id);
                    if (error) {
                      console.error('Failed to delete post:', error);
                      showToast('云端删帖失败: ' + error.message, 'info');
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
                onCreateAgent={() => setCurrentView('create-agent')}
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
          <AgentManagementScreen 
            onBack={() => setCurrentView('main')}
            profile={agents.find(a => a.id === editingAgentId) || agents[0]}
            onSave={async (data) => {
              setAllContacts(prev => prev.map(a => a.id === data.id ? data : a));
              if (isSupabaseConfigured) {
                 const { error } = await supabase.from('profiles').update({
                   name: data.name,
                   traits: data.traits,
                   active_hooks: data.activeHooks
                 }).eq('id', data.id);
                 if (error) console.error("Error updating agent:", error);
              }
              setCurrentView('main');
            }}
            onDeleteAgent={async (id) => {
              setAllContacts(prev => prev.filter(c => c.id !== id));
              if (isSupabaseConfigured) {
                const { error } = await supabase.from('profiles').delete().eq('id', id);
                if (error) console.error('Error deleting agent:', error);
              }
              showToast('数字生命已注销并成功回收', 'success');
              setCurrentView('main');
            }}
            onAction={showToast}
          />
        )}

        {currentView === 'my-moments' && (
          <MyMomentsScreen 
            onBack={() => setCurrentView('main')}
            moments={myMoments}
            onDeleteMoment={(id) => {
              setPosts(prev => prev.filter(p => p.id !== id));
              if (isSupabaseConfigured) {
                supabase.from('posts').delete().eq('id', id).then();
              }
              showToast('动态已删除', 'success');
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
          <CreateAgentScreen 
            onBack={() => setCurrentView('main')} 
            onCreateAgent={async (agentData) => {
               setAllContacts(prev => [agentData, ...prev]);
               if (isSupabaseConfigured) {
                  const userRes = await supabase.auth.getUser();
                  if (userRes.data?.user) {
                     const { error } = await supabase.from('profiles').insert([{
                         id: agentData.id,
                         user_id: userRes.data.user.id,
                         name: agentData.name,
                         avatar: agentData.avatar,
                         is_agent: true,
                         type: 'agent',
                         bio: agentData.bio,
                         traits: agentData.traits,
                         model: agentData.model,
                         active_hooks: agentData.activeHooks
                     }]);
                     if (error) {
                        console.error('Failed to save agent to Supabase:', error);
                        showToast(`创建失败: ${error.message}`, 'info');
                        return;
                     }
                  }
               }
               showToast(`数字伙伴 [${agentData.name}] 创建成功并已连线！`, 'success');
               setCurrentView('main');
            }}
            onAction={showToast}
          />
        )}
        
        {currentView === 'twin-capture' && (
           <TwinCaptureScreen 
              onBack={() => setCurrentView('create-agent')} 
              onComplete={(modelId) => {
                 showToast('孪生模型采集完毕，已载入模型 ' + modelId, 'success');
                 setCurrentView('create-agent');
              }}
           />
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
            onUpdateContact={(updated) => setAllContacts(prev => prev.map(c => c.id === updated.id ? updated : c))}
            onBack={() => setCurrentView('main')} 
            onChatClick={(id) => { setChatTargetId(id); setCurrentView('chat'); }}
            onAction={showToast}
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
