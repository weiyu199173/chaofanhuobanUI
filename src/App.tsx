import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import type { AppTab, AppView } from '@/types';
import LoginScreen from '@/components/auth/LoginScreen';
import RegisterScreen from '@/components/auth/RegisterScreen';
import BottomNavBar from '@/components/layout/BottomNavBar';
import SideNavigation from '@/components/layout/SideNavigation';
import DiscoveryScreen from '@/components/social/DiscoveryScreen';
import MessagesScreen from '@/components/chat/MessagesScreen';
import ChatScreen from '@/components/chat/ChatScreen';
import ContactsScreen from '@/components/contacts/ContactsScreen';
import MeScreen from '@/components/profile/MeScreen';
import EditProfileScreen from '@/components/profile/EditProfileScreen';
import MyMomentsScreen from '@/components/profile/MyMomentsScreen';
import CreateAgentScreen from '@/components/agent/CreateAgentScreen';
import AgentDetailScreen from '@/components/agent/AgentDetailScreen';
import SkillWarehouseScreen from '@/components/agent/SkillWarehouseScreen';
import MCPMarketScreen from '@/components/agent/MCPMarketScreen';
import SettingsScreen from '@/components/settings/SettingsScreen';

export default function App() {
  const { state: authState, login, register, logout, showToast, toast } = useAuth();
  const { state: dataState } = useAppData();
  const [activeTab, setActiveTab] = useState<AppTab>('square');
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (authState.isLoading) return;
    setCurrentView(authState.isAuthenticated ? 'main' : 'login');
  }, [authState.isAuthenticated, authState.isLoading]);

  const handleProfileDetail = useCallback((id: string) => { setSelectedProfileId(id); setCurrentView('agentDetail'); }, []);
  const handleManageAgent = useCallback((id: string) => { setEditingAgentId(id); setCurrentView('editAgentProfile'); }, []);
  const goMain = useCallback(() => setCurrentView('main'), []);
  const goChat = useCallback(() => setCurrentView('chat'), []);

  const myMoments = dataState.posts.filter(p => p.author.name === authState.userProfile.nickname);
  const editingAgent = authState.agents.find(a => a.id === editingAgentId);

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/20">
      <AnimatePresence>
        {currentView === 'login' && <LoginScreen onLogin={() => login('', '')} onGoToRegister={() => setCurrentView('register')} />}
        {currentView === 'register' && <RegisterScreen onRegister={() => register('', '')} onBack={() => setCurrentView('login')} />}

        {currentView === 'main' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            {activeTab === 'square' && <DiscoveryScreen onProfileClick={handleProfileDetail} onMenuOpen={() => setIsSidebarOpen(true)} />}
            {activeTab === 'messages' && <MessagesScreen onChatClick={goChat} onMenuOpen={() => setIsSidebarOpen(true)} />}
            {activeTab === 'contacts' && <ContactsScreen onChatClick={goChat} onDetailClick={handleProfileDetail} onAction={showToast} onMenuOpen={() => setIsSidebarOpen(true)} />}
            {activeTab === 'me' && (
              <MeScreen onCreateAgent={() => setCurrentView('createAgent')} onManageAgent={handleManageAgent} onEditProfile={() => setCurrentView('editProfile')} onMyMoments={() => setCurrentView('myMoments')} bookmarkedPosts={authState.bookmarkedPosts} onMenuOpen={() => setIsSidebarOpen(true)} userProfile={authState.userProfile} agents={authState.agents} />
            )}
            <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
            <SideNavigation isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={logout} onNavigate={(view) => setCurrentView(view)} onTabChange={setActiveTab} userProfile={authState.userProfile} />
          </motion.div>
        )}

        {currentView === 'editProfile' && <EditProfileScreen onBack={goMain} profile={authState.userProfile} onSave={() => {}} />}
        {currentView === 'editAgentProfile' && (
          <EditProfileScreen onBack={goMain} profile={{ nickname: editingAgent?.name || '', avatar: editingAgent?.avatar || '', bio: editingAgent?.bio || '', gender: '', phone: '', accountId: '', region: '' }} onSave={() => {}} isAgent agentProfile={editingAgent} onAgentSave={() => {}} />
        )}
        {currentView === 'myMoments' && <MyMomentsScreen onBack={goMain} moments={myMoments} />}
        {currentView === 'skillWarehouse' && <SkillWarehouseScreen onBack={goMain} onAction={showToast} />}
        {currentView === 'mcpMarket' && <MCPMarketScreen onBack={goMain} onAction={showToast} />}
        {currentView === 'settings' && <SettingsScreen onBack={goMain} onAction={showToast} />}
        {currentView === 'createAgent' && <CreateAgentScreen onBack={goMain} />}
        {currentView === 'chat' && <ChatScreen onBack={goMain} />}
        {currentView === 'agentDetail' && <AgentDetailScreen profileId={selectedProfileId} onBack={goMain} onChatClick={goChat} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-on-surface text-background rounded-full font-bold text-xs shadow-2xl flex items-center gap-3 backdrop-blur-xl">
            {toast.type === 'success' ? <CheckCircle size={14} className="text-primary" /> : <Info size={14} className="text-primary" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-primary-container/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
