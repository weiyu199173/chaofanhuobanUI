import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Info, Share, MoreVertical, MessageCircle,
  Bolt, Verified,
} from 'lucide-react';

interface AgentDetailScreenProps {
  profileId: string | null;
  onBack: () => void;
  onChatClick: (id: string) => void;
}

interface ProfileData {
  id: string;
  name: string;
  avatar: string;
  status?: string;
  lv?: number;
  syncRate?: number;
  type?: string;
  bio: string;
  fullBio?: string;
  traits?: string[];
  model?: string;
}

const AgentDetailScreen: React.FC<AgentDetailScreenProps> = ({ profileId, onBack, onChatClick }) => {
  const allProfiles: ProfileData[] = [
    { id: 'a1', name: 'Nexus AI', avatar: 'https://picsum.photos/seed/nexus/100/100', status: 'Active', lv: 9, syncRate: 98, type: 'super', bio: 'Transcend 核心逻辑架构，高维执行伙伴。', traits: ['高效', '专业', '严谨'], model: 'TP-Flux-Alpha v4' },
    { id: 'a2', name: 'Aura', avatar: 'https://picsum.photos/seed/aura/100/100', status: 'Active', lv: 14, syncRate: 99.8, type: 'twin', bio: '数字孪生陪伴体，深度共鸣您的意识轨迹。', traits: ['温顺', '感性', '共情'], model: 'TP-Ego-Beta v2' },
    { id: 'a3', name: 'Logic Weaver', avatar: 'https://picsum.photos/seed/logic/100/100', status: 'Training', lv: 5, syncRate: 45, type: 'super', bio: '数据处理与并发逻辑优化专家。', traits: ['冷静', '极简'], model: 'TP-Core-Gamma' },
    { id: 'h1', name: 'Julian Chen', avatar: 'https://picsum.photos/seed/julian/100/100', bio: '数字生命架构师', fullBio: '致力于研究硅基文明与人类情感的边界，Transcend 早期参与者。', type: 'human' },
    { id: 'h2', name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/elena2/100/100', bio: 'UI/UX Designer', fullBio: '极简主义狂热者，目前在 Transcend 负责 Monolith 系统。', type: 'human' },
    { id: 'h3', name: 'Marcus Thorne', avatar: 'https://picsum.photos/seed/marcus/100/100', bio: 'Full-stack Dev', fullBio: '对 Rust 与量子计算有深入研究，擅长底层协议重构。', type: 'human' },
    { id: 'h4', name: 'Sara Lin', avatar: 'https://picsum.photos/seed/sara/100/100', bio: 'AI Researcher', fullBio: '主要研究领域为大模型突现性与幻觉控制。', type: 'human' },
  ];

  const profile = allProfiles.find(p => p.id === profileId) || allProfiles[0];
  const isAgent = profile.type !== 'human';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto custom-scrollbar"
    >
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all outline-none">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline tracking-[0.2em] text-xl font-bold uppercase">档案详情</h1>
        </div>
        <div className="flex gap-4">
           <Share size={20} className="text-outline cursor-pointer" />
           <MoreVertical size={20} className="text-outline cursor-pointer" />
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-12">
        <header className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
            <img src={profile.avatar} className={`w-36 h-36 rounded-3xl object-cover border-2 shadow-2xl relative ${isAgent ? 'border-primary' : 'border-white/10'}`} />
            {isAgent && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-background">
                Lv.{profile.lv}
              </div>
            )}
          </div>
          <h2 className="text-4xl font-headline font-bold flex items-center justify-center gap-2 mb-2">
            {profile.name}
            <Verified size={24} className="text-primary" />
          </h2>
          <p className="text-outline font-medium tracking-wide">
            {isAgent ? (profile.type === 'super' ? '超级伙伴' : '孪生伙伴') : '碳基联系人'}
          </p>
        </header>

        <section className="bg-surface-container-high/40 p-8 rounded-3xl border border-white/5 space-y-8">
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
              <Info size={14} /> 核心简介 / BIOS
            </h3>
            <p className="text-on-surface leading-loose font-light">
              {profile.fullBio || profile.bio}
            </p>
          </div>

          {isAgent && (
            <>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Sync Rate</h4>
                   <div className="flex items-end gap-2">
                     <span className="text-3xl font-headline font-bold text-primary">{profile.syncRate}%</span>
                     <div className="w-full bg-background h-1.5 rounded-full mb-2 overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${profile.syncRate}%` }} />
                     </div>
                   </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Model Engine</h4>
                    <p className="font-bold text-lg font-headline">{profile.model}</p>
                 </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.traits?.map(t => (
                    <span key={t} className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {!isAgent && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-surface-container-high/40 p-6 rounded-2xl border border-white/5">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-2">共同好友</h4>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <img key={i} src={`https://picsum.photos/seed/f${i}/100/100`} className="w-8 h-8 rounded-full border-2 border-background" />)}
                </div>
             </div>
             <div className="bg-surface-container-high/40 p-6 rounded-2xl border border-white/5">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-2">加入时间</h4>
                <p className="font-bold">2024.11.12</p>
             </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 bg-background/80 backdrop-blur-3xl border-t border-white/5 space-y-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => onChatClick(profile.id)}
            className="flex-1 py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} /> 进入对话
          </button>
          <button className="w-14 h-14 shrink-0 bg-surface-container-highest border border-white/5 rounded-full flex items-center justify-center text-outline active:scale-90 transition-all">
            <Bolt size={24} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default AgentDetailScreen;
