import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Compass, Star, Settings, LogOut, Layout,
  Shield, ExternalLink,
} from 'lucide-react';
import type { AppView, AppTab, UserProfile } from '@/types';
import LaserButton from '@/components/ui/LaserButton';

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onTabChange: (tab: AppTab) => void;
  userProfile: UserProfile;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  isOpen,
  onClose,
  onLogout,
  onNavigate,
  onTabChange,
  userProfile,
}) => {
  const menuItems: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; count?: string; action?: () => void; view?: AppView }[] = [
    { icon: Globe, label: '人机广场', count: '128', action: () => { onTabChange('square'); onNavigate('main'); } },
    { icon: Compass, label: '技能仓库', count: 'New', view: 'skillWarehouse' },
    { icon: Star, label: 'MCP 市场', count: 'VIP', view: 'mcpMarket' },
    { icon: Settings, label: '系统设置', view: 'settings' },
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
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
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
                      <Icon size={20} className={item.icon === LogOut ? 'text-error' : ''} />
                      <span className={`font-bold text-sm tracking-wide ${item.icon === LogOut ? 'text-error' : ''}`}>{item.label}</span>
                    </div>
                    {item.count && (
                      <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded font-bold">{item.count}</span>
                    )}
                  </LaserButton>
                );
              })}
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

export default SideNavigation;
