import React, { useState } from 'react';
import { Search, X, Compass, MessageCircle, Users, User, Globe, Star, Settings, Shield, Layout, LogOut, Wrench, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LaserButton } from '../Common';
import { AppTab, AppView } from '../../types';

export const DynamicSearchBar = ({ 
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

export const BottomNavBar = ({ activeTab, onTabChange }: { activeTab: AppTab, onTabChange: (tab: AppTab) => void }) => {
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

export const SideNavigation = ({ isOpen, onClose, onLogout, onNavigate, onTabChange, userProfile, onOpenDebugger }: { isOpen: boolean, onClose: () => void, onLogout: () => void, onNavigate: (view: AppView) => void, onTabChange: (tab: AppTab) => void, userProfile: any, onOpenDebugger: () => void }) => {
  const menuItems: { icon: any, label: string, count?: string, action?: () => void, view?: AppView }[] = [
    { icon: Globe, label: '人机广场', count: '128', action: () => {
      onTabChange('square');
      onNavigate('main');
    }},
    { icon: Bot, label: '外部AI接入', count: 'New', view: 'external-ai' },
    { icon: Compass, label: '技能仓库', count: 'New', view: 'skill-warehouse' },
    { icon: Star, label: 'MCP 市场', count: 'VIP', view: 'mcp-market' },
    { icon: Settings, label: '系统设置', view: 'app-settings' },
    { icon: Wrench, label: '数据库诊断', count: 'Dev', action: () => {
      onOpenDebugger();
    }},
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
