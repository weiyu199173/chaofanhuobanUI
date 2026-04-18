import React, { useState } from 'react';
import { Menu, PlusSquare, Command, Search, Verified } from 'lucide-react';
import { LaserButton } from '../Common';
import { Chat } from '../../types';

export const MessagesScreen = ({ onChatClick, onMenuOpen }: { onChatClick: (id: string) => void, onMenuOpen: () => void }) => {
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
