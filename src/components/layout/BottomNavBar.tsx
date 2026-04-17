import React from 'react';
import { Compass, MessageCircle, Users, User } from 'lucide-react';
import type { AppTab } from '@/types';

interface BottomNavBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const tabs: { id: AppTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'square', label: '广场', icon: Compass },
  { id: 'messages', label: '消息', icon: MessageCircle },
  { id: 'contacts', label: '通讯录', icon: Users },
  { id: 'me', label: '我', icon: User },
];

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-4 bg-background/80 backdrop-blur-xl shadow-[0_-20px_40px_rgba(0,0,0,0.4)] border-t border-white/5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-110 ${
              activeTab === tab.id ? 'text-primary font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            <Icon size={24} className={activeTab === tab.id ? 'fill-primary/20' : ''} />
            <span className="text-[10px] uppercase tracking-[0.05em] font-semibold mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
