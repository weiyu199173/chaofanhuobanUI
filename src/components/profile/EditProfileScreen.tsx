import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft, Camera, Phone, MapPin, QrCode,
} from 'lucide-react';
import type { UserProfile, DisplayAgent } from '@/types';

interface EditProfileScreenProps {
  onBack: () => void;
  profile: UserProfile;
  onSave: (data: UserProfile) => void;
  isAgent?: boolean;
  agentProfile?: DisplayAgent;
  onAgentSave?: (data: DisplayAgent) => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
  profile,
  onSave,
  isAgent = false,
  agentProfile,
  onAgentSave,
}) => {
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    if (isAgent && agentProfile && onAgentSave) {
      onAgentSave({
        ...agentProfile,
        name: formData.nickname,
        bio: formData.bio,
      });
    } else {
      onSave(formData);
    }
    onBack();
  };

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
        <button onClick={handleSave} className="text-primary font-bold tracking-widest text-sm uppercase px-4 py-2 hover:bg-primary/5 rounded-lg transition-all">
          保存
        </button>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-10 pb-20">
           <div className="flex flex-col items-center gap-4">
             <div className="relative group">
                <img src={formData.avatar} className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10" />
                <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                  <Camera size={24} className="text-white" />
                </div>
             </div>
             <p className="text-[10px] uppercase font-bold tracking-widest text-outline">更换头像</p>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1">昵称 / NICKNAME</label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
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
                    <img src={agentProfile?.linkedHuman?.avatar || "https://picsum.photos/seed/profile/200/200"} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{agentProfile?.linkedHuman?.name || 'Alex Chen (Me)'}</p>
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

export default EditProfileScreen;
