/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';

// Store
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';

// Shared and Layout
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
import { TokenManagementScreen } from './components/screens/TokenManagementScreen';
import { AgentProfileScreen } from './components/screens/AgentProfileScreen';

import { postService, profileService, authService } from './services/api';

/** 主布局组件 - 包含底部导航和侧边栏 */
function MainLayout() {
  const { activeTab, isSidebarOpen, setIsSidebarOpen, setActiveTab, showToast } = useAppStore();
  const { userProfile } = useAuthStore();
  const { posts, allContacts, bookmarkedPosts, agents } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const handleNavigate = (view: string) => {
    navigate('/' + view);
  };

  const handleProfileDetail = (id: string) => {
    if (id === 'me') {
      setActiveTab('me');
    } else {
      useAppStore.getState().setSelectedProfileId(id);
      navigate('/agent-detail');
    }
  };

  return (
    <motion.div
      key="main-app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <Routes>
        <Route
          path="/square"
          element={
            <DiscoveryScreen
              onAction={showToast}
              onProfileClick={handleProfileDetail}
              onBookmarkSync={(post, isRemoved) => useAppStore.getState().bookmarkPost(post, isRemoved)}
              onMenuOpen={() => setIsSidebarOpen(true)}
              posts={posts}
              userProfile={userProfile}
              agents={allContacts}
              onCreatePost={(post) => useAppStore.getState().addPost(post)}
              onUpdatePost={(post) => useAppStore.getState().updatePost(post)}
              onDeletePost={async (id) => {
                useAppStore.getState().deletePost(id);
                try {
                  await postService.deletePost(id);
                } catch (e: any) {
                  showToast('云端删帖失败: ' + e.message, 'info');
                }
              }}
            />
          }
        />
        <Route
          path="/messages"
          element={
            <MessagesScreen
              onChatClick={(id) => {
                useAppStore.getState().setChatTargetId(id);
                navigate('/chat');
              }}
              onMenuOpen={() => setIsSidebarOpen(true)}
              allContacts={allContacts}
            />
          }
        />
        <Route
          path="/contacts"
          element={
            <ContactsScreen
              allContacts={allContacts}
              onChatClick={(id) => {
                useAppStore.getState().setChatTargetId(id);
                navigate('/chat');
              }}
              onDetailClick={handleProfileDetail}
              onAction={showToast}
              onMenuOpen={() => setIsSidebarOpen(true)}
              onUpdateContact={(updated) => useAppStore.getState().updateContact(updated)}
              onCreateAgent={() => navigate('/create-agent')}
            />
          }
        />
        <Route
          path="/me"
          element={
            <MeScreen
              onCreateAgent={() => navigate('/create-agent')}
              onManageAgent={(id) => {
                useAppStore.getState().setEditingAgentId(id);
                navigate('/edit-agent-profile');
              }}
              onEditProfile={() => navigate('/edit-profile')}
              onMyMoments={() => navigate('/my-moments')}
              bookmarkedPosts={bookmarkedPosts}
              onMenuOpen={() => setIsSidebarOpen(true)}
              onLogout={handleLogout}
              userProfile={userProfile}
              agents={agents()}
            />
          }
        />
        {/* 默认重定向到广场 */}
        <Route path="*" element={<Navigate to="/square" replace />} />
      </Routes>
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <SideNavigation
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onTabChange={setActiveTab}
        userProfile={userProfile}
      />
    </motion.div>
  );
}

/** 子页面路由包装器 - 仅在当前路径匹配子路由时渲染，避免 catch-all 与 MainLayout 冲突 */
const SUB_ROUTE_PATHS = [
  '/edit-profile', '/edit-agent-profile', '/my-moments',
  '/skill-warehouse', '/mcp-market', '/app-settings',
  '/create-agent', '/twin-capture', '/chat',
  '/agent-detail', '/token-management',
];

function SubRoutesWrapper() {
  const location = useLocation();
  const pathname = location.pathname;
  // 匹配精确子路由路径或 /agent-profile/:id
  const isSubRoute = SUB_ROUTE_PATHS.includes(pathname) || pathname.startsWith('/agent-profile/');
  return isSubRoute ? <SubRoutes /> : null;
}

/** 子页面路由 - 不含底部导航 */
function SubRoutes() {
  const navigate = useNavigate();
  const { showToast } = useAppStore();
  const { userProfile } = useAuthStore();
  const { allContacts, posts, agents, editingAgentId, selectedProfileId, chatTargetId } = useAppStore();

  const goMain = () => navigate('/square');

  return (
    <Routes>
      <Route
        path="/edit-profile"
        element={
          <EditProfileScreen
            onBack={goMain}
            profile={userProfile}
            onSave={(data) => useAuthStore.getState().updateUserProfile(data)}
          />
        }
      />
      <Route
        path="/edit-agent-profile"
        element={
          <AgentManagementScreen
            onBack={goMain}
            profile={agents().find((a) => a.id === editingAgentId) || agents()[0]}
            onSave={async (data) => {
              useAppStore.getState().updateContact(data);
              try {
                await profileService.updateAgent(data.id, {
                  name: data.name,
                  traits: data.traits,
                  active_hooks: data.activeHooks,
                  model: data.model,
                });
              } catch (e) {
                console.error('Error updating agent:', e);
              }
              goMain();
            }}
            onDeleteAgent={async (id) => {
              useAppStore.getState().removeContact(id);
              try {
                await profileService.deleteAgent(id);
              } catch (e) {
                console.error('Error deleting agent:', e);
              }
              showToast('数字生命已注销并成功回收', 'success');
              goMain();
            }}
            onAction={showToast}
          />
        }
      />
      <Route
        path="/my-moments"
        element={
          <MyMomentsScreen
            onBack={goMain}
            moments={useAppStore.getState().myMoments(userProfile.nickname)}
            onDeleteMoment={(id) => {
              useAppStore.getState().deletePost(id);
              try {
                postService.deletePost(id);
              } catch (e) {
                console.error('Failed to delete moment:', e);
              }
              showToast('动态已删除', 'success');
            }}
          />
        }
      />
      <Route
        path="/skill-warehouse"
        element={<SkillWarehouseScreen onBack={goMain} onAction={showToast} />}
      />
      <Route
        path="/mcp-market"
        element={<MCPMarketScreen onBack={goMain} onAction={showToast} />}
      />
      <Route
        path="/app-settings"
        element={<SettingsScreen onBack={goMain} onAction={showToast} />}
      />
      <Route
        path="/create-agent"
        element={
          <CreateAgentScreen
            onBack={goMain}
            onCreateAgent={async (agentData) => {
              useAppStore.getState().addContact(agentData);
              try {
                const user = await authService.getUser();
                if (user) {
                  await profileService.createAgent({
                    id: agentData.id,
                    user_id: user.id,
                    name: agentData.name,
                    avatar: agentData.avatar,
                    is_agent: true,
                    type: 'agent',
                    bio: agentData.bio,
                    traits: agentData.traits,
                    model: agentData.model,
                    active_hooks: agentData.activeHooks,
                  });
                }
              } catch (e: any) {
                showToast(`创建失败: ${e.message}`, 'info');
                return;
              }
              showToast(`数字伙伴 [${agentData.name}] 创建成功并已连线！`, 'success');
              goMain();
            }}
            onAction={showToast}
          />
        }
      />
      <Route
        path="/twin-capture"
        element={
          <TwinCaptureScreen
            onBack={() => navigate('/create-agent')}
            onComplete={(modelId) => {
              showToast('孪生模型采集完毕，已载入模型 ' + modelId, 'success');
              navigate('/create-agent');
            }}
          />
        }
      />
      <Route
        path="/chat"
        element={
          <ChatScreen
            onBack={goMain}
            targetId={chatTargetId}
            agents={allContacts}
            userProfile={userProfile}
            onProfileClick={(id) => {
              if (id === 'me') {
                useAppStore.getState().setActiveTab('me');
                navigate('/me');
              } else {
                useAppStore.getState().setSelectedProfileId(id);
                navigate('/agent-detail');
              }
            }}
            onAction={showToast}
          />
        }
      />
      <Route
        path="/agent-detail"
        element={
          <AgentDetailScreen
            profileId={selectedProfileId}
            allContacts={allContacts}
            onUpdateContact={(updated) => useAppStore.getState().updateContact(updated)}
            onBack={goMain}
            onChatClick={(id) => {
              useAppStore.getState().setChatTargetId(id);
              navigate('/chat');
            }}
            onAction={showToast}
            onViewProfile={(id) => navigate(`/agent-profile/${id}`)}
          />
        }
      />
      <Route
        path="/token-management"
        element={
          <TokenManagementScreen
            onBack={goMain}
            onAction={showToast}
          />
        }
      />
      <Route
        path="/agent-profile/:id"
        element={
          <AgentProfileScreen
            onBack={goMain}
            onAction={showToast}
          />
        }
      />
      {/* 未匹配的子路由重定向到主页 */}
      <Route path="*" element={<Navigate to="/square" replace />} />
    </Routes>
  );
}

export default function App() {
  const { isLoggedIn } = useAuthStore();
  const { toast, initData, showToast } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 初始化认证和数据
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initAuth();
    initData();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 监听登录状态变化，自动跳转
  useEffect(() => {
    if (isLoggedIn && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/square', { replace: true });
      showToast('账号验证成功，欢迎回来', 'success');
    } else if (!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register') {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/20">
      {!isSupabaseConfigured && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-3 py-1 bg-primary/10 border border-primary/20 backdrop-blur-md rounded-full flex items-center gap-2 pointer-events-none">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">单机演示模式</span>
        </div>
      )}

      <Routes location={location}>
          {/* 登录页 */}
          <Route
            path="/login"
            element={
              <LoginScreen
                onLogin={(user) => {
                  useAuthStore.getState().login(user);
                  navigate('/square', { replace: true });
                }}
                onGoToRegister={() => navigate('/register')}
                onAction={showToast}
              />
            }
          />
          {/* 注册页 */}
          <Route
            path="/register"
            element={
              <RegisterScreen
                onRegister={(user) => {
                  useAuthStore.getState().register(user);
                  navigate('/square', { replace: true });
                }}
                onBack={() => navigate('/login')}
                onAction={showToast}
              />
            }
          />
          {/* 主布局路由（含底部导航） */}
          <Route path="/*" element={<MainLayout />} />
        </Routes>

      {/* 子页面覆盖层路由（不含底部导航） */}
      {isLoggedIn && <SubRoutesWrapper />}

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
