import React, { useState } from 'react';
import { Menu, Plus, UserCog, Search, PlusCircle, ChevronRight, Verified, Share, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LaserButton, TiltedCard } from '../Common';

export const ContactsScreen = ({ onChatClick, onDetailClick, onAction, onMenuOpen }: { 
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
