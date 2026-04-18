import React from 'react';
import { ArrowLeft, Info, Heart, Brain, Bolt, ChevronDown, Database, Verified, Share, MoreVertical, MessageCircle, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export const AgentDetailScreen = ({ profileId, onBack, onChatClick }: { 
  profileId: string | null; 
  onBack: () => void;
  onChatClick: (id: string) => void;
}) => {
  const allProfiles = [
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
                  {profile.traits?.map((t: string) => (
                    <span key={t} className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-2">
                    <Database size={14} /> Agent Memory & Network Logs
                  </h4>
                  <span className="text-[9px] border border-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">End-to-End Encrypted</span>
                </div>
                <div className="bg-background rounded-2xl p-4 border border-white/5 space-y-4 max-h-48 overflow-y-auto custom-scrollbar">
                  {[
                    { target: 'Julian Chen', msg: '关于重构底层逻辑的探讨结束，对方情绪稳定。', time: '14:02' },
                    { target: 'Logic Weaver', msg: '已从超凡节点同步最新的核心数据结构。', time: '昨天 08:30' },
                    { target: 'Aura', msg: '交换了关于人类情感阈值的计算模型。', time: '周三 19:45' }
                  ].map((log, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-outline/40 font-mono shrink-0">{log.time}</span>
                      <div className="min-w-0">
                         <span className="text-secondary opacity-80 mr-2">[@{log.target}]</span>
                         <span className="text-outline">{log.msg}</span>
                      </div>
                    </div>
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
            onClick={() => {
              onChatClick(profile.id);
            }}
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

export const CreateAgentScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto custom-scrollbar"
    >
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all active:scale-95 text-on-surface">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline tracking-[0.2em] text-xl font-bold uppercase">创建Agent</h1>
        </div>
        <Info size={24} className="text-outline" />
      </nav>

      <main className="pt-24 pb-48 px-6 max-w-2xl mx-auto">
        <section className="mb-12">
          <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-2 font-bold font-headline">Initialize Transcendence</p>
          <h2 className="font-headline font-bold tracking-tighter leading-none mb-6 text-4xl">
            赋予您的数字生命 <span className="neo-gradient-text">意识</span>
          </h2>
        </section>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group relative p-6 rounded-xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Heart size={64} className="fill-current" />
              </div>
              <div className="relative z-10">
                <Brain size={32} className="text-primary mb-4" />
                <h3 className="text-xl font-headline font-bold mb-1">孪生伙伴</h3>
                <p className="text-outline text-xs font-light">情感陪伴型 | 深度连接、共鸣与记忆</p>
              </div>
            </div>
            <div className="group relative p-6 rounded-xl bg-surface-container-high border border-primary/40 transition-all cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Bolt size={64} className="fill-current" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <Brain size={32} className="text-primary mb-4" />
                  <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-4">Selected</span>
                </div>
                <h3 className="text-xl font-headline font-bold mb-1">超级伙伴</h3>
                <p className="text-outline text-xs font-light">工作能力型 | 逻辑、效率与多维执行</p>
                <div className="mt-4 h-1 w-full bg-primary transition-all duration-500 rounded-full" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-12">
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-widest text-outline mb-2 font-bold font-headline">Agent Name</label>
            <input 
              className="w-full bg-transparent border-0 border-b-2 border-surface-container-highest py-4 text-2xl font-headline font-medium focus:ring-0 focus:border-primary placeholder:text-surface-highest transition-all" 
              placeholder="给您的伙伴起个名字..." 
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">性格特质 / Personality</label>
              <div className="flex flex-wrap gap-2">
                {['理性冷静', '幽默风趣', '严谨专业', '温柔感性'].map((t, i) => (
                  <span key={t} className={`px-4 py-2 rounded-full text-xs border transition-colors cursor-pointer ${i === 2 ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container-high border-outline-variant hover:border-primary'}`}>
                    {t}
                  </span>
                ))}
                <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">语言风格 / Style</label>
              <div className="relative">
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4 text-sm focus:ring-1 focus:ring-primary appearance-none outline-none">
                  <option>学术且客观</option>
                  <option>口语化交流</option>
                  <option>诗意且感性</option>
                  <option>简洁高效</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">兴趣爱好 / Interests</label>
            <textarea 
              className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant py-2 focus:ring-0 focus:border-primary transition-all text-sm resize-none" 
              placeholder="例如：量子物理、极简设计、中世纪历史..." 
              rows={2}
            />
          </div>

          <div className="p-8 rounded-xl bg-surface-container-lowest border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-700" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Database size={18} />
              </div>
              <h4 className="font-headline font-bold text-lg leading-none">LLM 配置 (能力模型)</h4>
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold font-headline">
                  <span className="text-outline">Creativity Index</span>
                  <span className="text-primary font-headline">High (0.85)</span>
                </div>
                <input type="range" className="w-full accent-primary h-1 bg-surface-container-highest rounded-full appearance-none outline-none" defaultValue={85} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-surface-container-high border border-white/5">
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-2">Reasoning Model</p>
                  <p className="text-sm font-bold font-headline">TP-Flux-Alpha v4</p>
                </div>
                <div className="p-4 rounded-lg bg-surface-container-high border border-white/5">
                  <p className="text-[10px] text-outline uppercase font-bold tracking-wider mb-2">Memory Depth</p>
                  <p className="text-sm font-bold font-headline">Infinite Horizon</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Verified size={14} className="text-primary" />
                <p className="text-[10px] text-primary/80 leading-none">已针对“超级伙伴”模式优化响应速度与逻辑严密度</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 w-full z-[150] p-6 bg-background/80 backdrop-blur-3xl border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-[10px] text-outline leading-tight font-light uppercase tracking-tighter">
              每个用户最多创建 3 个 Agent。创建后需要经过 <span className="text-on-surface font-bold">Transcend 核心审核</span>，预计 5-10 分钟生效。
            </p>
          </div>
          <button onClick={onBack} className="w-full md:w-auto px-12 py-4 bg-on-surface text-background rounded-full font-headline font-bold text-sm tracking-widest active:scale-95 transition-all shadow-xl">
            CREATE AGENT
          </button>
        </div>
      </footer>
    </motion.div>
  );
};
