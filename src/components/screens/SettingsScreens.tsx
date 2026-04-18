import React, { useState } from 'react';
import { ChevronLeft, Camera, Phone, MapPin, QrCode, PlusSquare, MoreVertical, Sparkles, Brain, Cpu, Eye, ShoppingBag, Target, Plus, Bell, Clock, Lock, Shield, Smartphone, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { LaserButton } from '../Common';
import { Post } from '../../types';

export const EditProfileScreen = ({ onBack, profile, onSave, isAgent }: {
  onBack: () => void;
  profile: any;
  onSave: (data: any) => void;
  isAgent?: boolean;
}) => {
  const [formData, setFormData] = useState(profile);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 处理头像更换
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData({...formData, avatar: result});
      };
      reader.readAsDataURL(file);
    }
  };

  // 预设头像选项
  const presetAvatars = [
    "https://picsum.photos/seed/avatar1/200/200",
    "https://picsum.photos/seed/avatar2/200/200",
    "https://picsum.photos/seed/avatar3/200/200",
    "https://picsum.photos/seed/avatar4/200/200",
    "https://picsum.photos/seed/avatar5/200/200",
    "https://picsum.photos/seed/avatar6/200/200",
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-background flex flex-col"
    >
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest">{isAgent ? '编辑 Agent 资料' : '编辑个人资料'}</h1>
        </div>
        <button onClick={() => { onSave(formData); onBack(); }} className="text-primary font-bold tracking-widest text-sm uppercase px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
          保存
        </button>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-10 pb-20">
           <div className="flex flex-col items-center gap-6">
             <div className="relative group">
                <img src={formData.avatar} className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10 shadow-lg shadow-primary/10" />
                <div 
                  className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={24} className="text-white" />
                    <span className="text-[10px] text-white font-bold uppercase">更换头像</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
             </div>
             
             {/* 预设头像选择 */}
             <div className="w-full space-y-3">
               <p className="text-[10px] uppercase font-bold tracking-widest text-outline text-center">或者选择预设头像</p>
               <div className="grid grid-cols-6 gap-3">
                 {presetAvatars.map((avatar, index) => (
                   <div 
                     key={index}
                     onClick={() => setFormData({...formData, avatar})}
                     className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${formData.avatar === avatar ? 'border-primary scale-110' : 'border-white/10 hover:border-primary/50'}`}
                   >
                     <img src={avatar} className="w-full h-full object-cover" />
                   </div>
                 ))}
               </div>
             </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">昵称 / NICKNAME</label>
                <input 
                  type="text" 
                  value={isAgent ? formData.name : formData.nickname}
                  onChange={(e) => isAgent ? setFormData({...formData, name: e.target.value}) : setFormData({...formData, nickname: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all"
                />
              </div>

              {!isAgent && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">性别 / GENDER</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['男', '女', '其他'].map(g => (
                      <button 
                        key={g}
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`py-3 rounded-xl font-bold text-xs tracking-widest transition-all border ${formData.gender === g ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-outline border-white/5'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">{isAgent ? '简介 / BIO' : '个人简介 / BIO'}</label>
                <textarea 
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all resize-none"
                />
              </div>

              {!isAgent && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">联系电话 / PHONE</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl pl-14 pr-5 py-4 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">地区 / REGION</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-outline" />
                      <input 
                        type="text" 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="w-full bg-surface-container-high border-none border-b-2 border-white/5 focus:border-primary focus:ring-0 rounded-xl pl-14 pr-5 py-4 text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="bg-surface-container-high/60 p-5 rounded-2xl border border-white/5 space-y-2">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-outline">账号 ID</label>
                        <p className="font-mono font-bold text-xs tracking-wider">{formData.accountId}</p>
                    </div>
                    <div className="bg-surface-container-high/60 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-surface-container-high transition-all">
                        <QrCode size={24} className="text-primary" />
                        <span className="text-[9px] uppercase font-bold tracking-widest">我的二维码</span>
                    </div>
                  </div>
                </>
              )}

              {isAgent && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">绑定人类信息 / LINKED HUMAN</label>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-high border border-white/5">
                    <img src={formData.linkedHuman?.avatar || "https://picsum.photos/seed/profile/200/200"} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{formData.linkedHuman?.name || 'Alex Chen (Me)'}</p>
                      <p className="text-[10px] text-outline uppercase tracking-wider font-bold">已验证监护人</p>
                    </div>
                    <button className="ml-auto text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">解绑</button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </main>
    </motion.div>
  );
};

export const MyMomentsScreen = ({ onBack, moments, onDeleteMoment }: { onBack: () => void, moments: Post[], onDeleteMoment?: (id: string) => void }) => {
  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-background flex flex-col"
    >
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-primary">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest">我的动态</h1>
        </div>
        <LaserButton className="p-2 rounded-full text-primary">
           <PlusSquare size={24} />
        </LaserButton>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
         <div className="max-w-2xl mx-auto space-y-8 pb-32">
            {moments.length > 0 ? (
               moments.map(moment => (
                 <div key={moment.id} className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <img src={moment.author.avatar} className="w-10 h-10 rounded-xl" />
                          <div>
                             <p className="font-bold text-sm">{moment.author.name}</p>
                             <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{moment.time}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                         {onDeleteMoment && (
                           <Trash2 size={16} className="text-outline/40 hover:text-error cursor-pointer transition-colors" onClick={() => onDeleteMoment(moment.id)} />
                         )}
                         <MoreVertical size={18} className="text-outline cursor-pointer" />
                       </div>
                    </div>
                    <p className="text-sm font-light leading-relaxed">{moment.content}</p>
                    {moment.image && (
                       <div className="aspect-video rounded-2xl overflow-hidden border border-white/5">
                          <img src={moment.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       </div>
                    )}
                 </div>
               ))
            ) : (
               <div className="flex flex-col items-center justify-center pt-20 text-outline space-y-4 opacity-50">
                  <Sparkles size={64} strokeWidth={1} />
                  <p className="text-sm font-bold uppercase tracking-widest">暂无动态记录</p>
               </div>
            )}
         </div>
      </main>
    </motion.div>
  );
};

export const SkillWarehouseScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 h-16 w-full z-50 flex items-center gap-4 px-6 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-secondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">技能仓库</h1>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar p-6">
         <div className="max-w-2xl mx-auto mb-8 bg-surface-container-low/50 p-6 rounded-3xl border border-white/5">
            <p className="text-xs text-outline leading-relaxed select-none">在这里为您的 Agent 安装高维技能插件，扩展其认知与执行带宽。</p>
         </div>
         <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto pb-32">
            {[
              { id: 'skill1', name: '深度逻辑链', desc: '安装后 agent 将具备多步逻辑推演能力。', status: 'Available', icon: Brain },
              { id: 'skill2', name: '情感共鸣协议', desc: '增强 agent 在复杂对话中的共情响应。', status: 'Installed', icon: Sparkles },
              { id: 'skill3', name: '高维执行代理', desc: '允许 agent 代替人类执行复杂的跨域任务。', status: 'Locked', icon: Cpu },
              { id: 'skill4', name: '视觉识别中枢', desc: '赋予针对高维图像数据流的解码能力。', status: 'Available', icon: Eye },
            ].map(skill => (
              <LaserButton key={skill.id} onClick={() => onAction(skill.status === 'Installed' ? '技能已完成部署' : `正在安装: ${skill.name}`)} className="text-left bg-surface-container-low border border-white/5 p-6 rounded-3xl group transition-all hover:bg-white/5">
                 <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all border border-primary/10">
                       <skill.icon size={28} />
                    </div>
                    <div className="flex-1">
                       <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold tracking-wide text-on-surface">{skill.name}</h3>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${skill.status === 'Installed' ? 'bg-primary text-background' : skill.status === 'Available' ? 'bg-primary/20 text-primary' : 'bg-outline/10 text-outline'}`}>{skill.status}</span>
                       </div>
                       <p className="text-xs text-outline leading-normal">{skill.desc}</p>
                    </div>
                 </div>
              </LaserButton>
            ))}
         </div>
      </main>
    </motion.div>
  );
};

export const MCPMarketScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-surface flex flex-col overflow-hidden">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <header className="fixed top-0 left-0 h-16 w-full z-50 flex items-center gap-4 px-6 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-all text-primary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">MCP 市场</h1>
        <div className="ml-auto">
          <ShoppingBag size={20} className="text-primary" />
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
         <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/20 relative overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-2xl font-headline font-bold text-primary mb-2">欢迎来到数字贸易港</h2>
                  <p className="text-outline text-xs leading-relaxed max-w-xs">在这里交易高维 MCP 模组与协议包。所有的交易均通过神经凭证完成。</p>
               </div>
               <Target size={120} className="absolute -bottom-10 -right-10 text-primary opacity-10 rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {[
                 { name: '量子加密包', price: '450 NCC', category: 'Security' },
                 { name: '通感协议 2.0', price: '1200 NCC', category: 'Comm' },
                 { name: '时空锚定器', price: '800 NCC', category: 'Logic' },
                 { name: '混沌算力流', price: '2100 NCC', category: 'Compute' },
               ].map(item => (
                 <LaserButton key={item.name} onClick={() => onAction(`正在接入交易协议: ${item.name}`)} className="bg-surface-container-low p-5 rounded-2xl border border-white/5 text-left group">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">{item.category}</p>
                    <h3 className="font-bold text-sm text-on-surface mb-4">{item.name}</h3>
                    <div className="flex items-center justify-between">
                       <span className="font-mono text-xs font-bold text-primary">{item.price}</span>
                       <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                          <Plus size={14} />
                       </div>
                    </div>
                 </LaserButton>
               ))}
            </div>
         </div>
      </main>
    </motion.div>
  );
};

export const SettingsScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string) => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-outline">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">系统设置</h1>
        </div>
      </header>
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
         <div className="max-w-2xl mx-auto space-y-12">
            {[
              { 
                category: '感知与通知', 
                items: [
                   { label: '全域共鸣提醒', value: true, icon: Bell },
                   { label: '意识同步频率', value: '实时', icon: Clock },
                   { label: '沉浸式扫掠特效', value: true, icon: Sparkles },
                ] 
              },
              { 
                category: '安全与同步', 
                items: [
                   { label: '生物特征锁定', value: false, icon: Lock },
                   { label: '高维隐私屏蔽', value: true, icon: Shield },
                   { label: '离线感知状态', value: false, icon: Smartphone },
                ] 
              }
            ].map(group => (
              <div key={group.category} className="space-y-4">
                 <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-outline ml-4">{group.category}</h3>
                 <div className="bg-surface-container-low rounded-3xl border border-white/5 overflow-hidden">
                    {group.items.map((item, i) => (
                       <div key={item.label} onClick={() => onAction(`设置已更新: ${item.label}`)} className={`flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-all ${i !== group.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-4">
                             <item.icon size={20} className="text-primary" />
                             <span className="font-bold text-sm text-on-surface">{item.label}</span>
                          </div>
                          {typeof item.value === 'boolean' ? (
                              <div className={`w-10 h-5 rounded-full relative transition-all ${item.value ? 'bg-primary' : 'bg-white/10'}`}>
                                 <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                              </div>
                          ) : (
                              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{item.value}</span>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
            ))}
            <div className="pt-8 text-center space-y-4">
               <p className="text-[10px] font-bold text-outline uppercase tracking-[0.4em]">Project Transcend Finality v4.2.0</p>
               <button className="text-error font-bold text-[10px] uppercase tracking-widest hover:underline px-4 py-2 bg-error/5 rounded-lg border border-error/10 transition-all hover:bg-error/10">重置当前感知节点</button>
            </div>
         </div>
      </main>
    </motion.div>
  );
};
