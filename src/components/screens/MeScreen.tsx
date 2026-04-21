import React from 'react';
import { Menu, Plus, Search, Verified, Shield, Brain, ChevronRight, Sparkles, Bookmark, FileText as FileIcon, Music, UserCog, Lock, Info, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { LaserButton, TiltedCard } from '../Common';
import { Post } from '../../types';

export const MeScreen = ({ 
  onCreateAgent, 
  onManageAgent, 
  onEditProfile,
  onMyMoments,
  bookmarkedPosts,
  onMenuOpen,
  onLogout,
  userProfile,
  agents
}: { 
  onCreateAgent: () => void, 
  onManageAgent: (id: string) => void,
  onEditProfile: () => void,
  onMyMoments: () => void,
  bookmarkedPosts: Post[],
  onMenuOpen: () => void,
  onLogout: () => void,
  userProfile: any,
  agents: any[]
}) => {
  return (
    <div className="h-full flex flex-col bg-background pb-32 overflow-hidden relative">
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onMenuOpen} className="p-2 rounded-full text-primary">
            <Menu size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">TranscendPartner</h1>
        </div>
        <div className="flex items-center gap-4">
          <LaserButton onClick={onCreateAgent} className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all">
            <Plus size={22} />
          </LaserButton>
          <LaserButton className="p-2 rounded-full text-primary">
            <Search size={22} />
          </LaserButton>
        </div>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          <section className="relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <TiltedCard className="relative group shrink-0">
                <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary-container rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-surface-container-high bg-surface-container">
                  <img src={userProfile.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-1 right-1 bg-primary w-6 h-6 rounded-sm flex items-center justify-center shadow-lg border border-background">
                  <Verified size={14} className="text-on-primary fill-on-primary" />
                </div>
              </TiltedCard>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold">{userProfile.nickname}</h2>
                  <p className="text-outline text-sm max-w-lg leading-relaxed">
                    {userProfile.bio}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-surface-container-low px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-outline font-bold">监护信用</p>
                      <p className="text-xl font-headline font-bold text-on-surface leading-tight">982</p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                      <Brain size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-outline font-bold">合作伙伴</p>
                      <p className="text-xl font-headline font-bold text-on-surface leading-tight">{agents.length.toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                  <LaserButton onClick={onEditProfile} className="bg-on-surface text-background px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase active:scale-95 transition-all shadow-lg hover:shadow-white/5">
                    编辑资料
                  </LaserButton>
                </div>
              </div>
            </div>
          </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={onMyMoments} className="md:col-span-2 bg-surface-container-high/40 rounded-xl p-6 border border-white/5 hover:bg-surface-container-high transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-xl font-headline font-semibold flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                我的动态
              </h3>
              <ChevronRight className="text-outline group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <img src="https://picsum.photos/seed/d1/400/225" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              </div>
              <div className="aspect-video rounded-lg overflow-hidden relative">
                <img src="https://picsum.photos/seed/d2/400/225" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>

          <div className="bg-surface-container-high/40 rounded-xl p-6 border border-white/5 hover:bg-surface-container-high transition-all">
            <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2">
              <Bookmark size={20} className="text-primary" />
              我的收藏 ({bookmarkedPosts.length})
            </h3>
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {bookmarkedPosts.length > 0 ? (
                bookmarkedPosts.map(post => (
                  <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-white/5">
                    <img src={post.author.avatar} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">{post.content}</p>
                      <p className="text-[10px] text-outline uppercase mt-1">广场动态 • {post.author.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <FileIcon size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">超越图灵：意识的数字化...</p>
                      <p className="text-[10px] text-outline uppercase mt-1">PDF • 2.4MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary">
                      <Music size={24} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">Agent 012 的共鸣频率</p>
                      <p className="text-[10px] text-outline uppercase mt-1">Audio • 12:45</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xl font-headline font-semibold mb-6 flex items-center gap-2 px-2">
              <Brain size={20} className="text-primary" />
              我的 AI 伙伴名片
            </h3>
            <div className="flex gap-6 overflow-x-auto pb-4 px-2 custom-scrollbar">
              {agents.map(agent => (
                <motion.div 
                  key={agent.id} 
                  whileHover={{ y: -5 }}
                  className="min-w-[280px] bg-surface-container-high rounded-3xl overflow-hidden border border-white/5 relative group shadow-2xl"
                >
                  <div className={`h-24 opacity-20 bg-linear-to-br ${agent.id === '1' ? 'from-primary to-primary-container' : 'from-secondary to-pink-500'}`} />
                  <div className="px-6 pb-6 -mt-10 relative">
                    <div className="flex justify-between items-end mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-background border-2 border-white/5 p-1 relative">
                        <img src={agent.avatar} className="w-full h-full object-cover rounded-xl" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${agent.status === 'active' ? 'bg-primary' : 'bg-yellow-500'}`} />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Sync Progress</p>
                        <p className={`text-lg font-headline font-bold ${agent.id === '1' ? 'text-primary' : 'text-secondary'}`}>{agent.syncRate}%</p>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-headline font-bold flex items-center gap-2 mb-2">
                      {agent.name}
                      <Verified size={16} className="text-primary" />
                    </h4>
                    
                    <div className="flex gap-1.5 mb-4">
                      {agent.traits.map((t: string) => (
                        <span key={t} className="text-[9px] px-2 py-0.5 bg-background/50 border border-white/5 rounded-sm text-outline font-medium">{t}</span>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${agent.id === '1' ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${agent.syncRate}%` }} />
                      </div>
                      <div className="flex justify-between gap-3">
                        <button 
                          onClick={() => onManageAgent(agent.id)}
                          className="flex-1 py-2 bg-on-surface text-background text-[10px] font-bold uppercase tracking-widest rounded-lg active:scale-95 transition-all outline-none"
                        >
                          管理
                        </button>
                        <button className="flex-1 py-2 bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/5 active:scale-95 transition-all outline-none">互动</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div 
                onClick={onCreateAgent}
                className="min-w-[280px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-primary/20 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                  <Plus size={32} />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-outline">创建新伙伴</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-outline ml-2">系统设置</h3>
          <div className="bg-surface-container-high/40 rounded-xl divide-y divide-white/5 border border-white/5">
            {[
              { label: '账户设置', icon: UserCog },
              { label: '隐私设置', icon: Lock },
              { label: '关于我们', icon: Info },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                    <item.icon size={20} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-outline" />
              </div>
            ))}
            <div 
              onClick={onLogout}
              className="flex items-center justify-between p-5 hover:bg-error/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-error/5 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-all">
                  <LogOut size={20} />
                </div>
                <span className="font-medium text-error">退出登录</span>
              </div>
              <ChevronRight size={18} className="text-error opacity-50" />
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
);
};
