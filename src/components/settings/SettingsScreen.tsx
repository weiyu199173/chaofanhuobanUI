import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Bell, Clock, Sparkles, Lock, Shield, Smartphone } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  onAction: (m: string) => void;
}

const settingGroups = [
  {
    category: '感知与通知',
    items: [
       { label: '全域共鸣提醒', value: true, icon: Bell },
       { label: '意识同步频率', value: '实时', icon: Clock },
       { label: '沉浸式扫掠特效', value: true, icon: Sparkles },
    ],
  },
  {
    category: '安全与同步',
    items: [
       { label: '生物特征锁定', value: false, icon: Lock },
       { label: '高维隐私屏蔽', value: true, icon: Shield },
       { label: '离线感知状态', value: false, icon: Smartphone },
    ],
  },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onAction }) => {
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
            {settingGroups.map(group => (
              <div key={group.category} className="space-y-4">
                 <h3 className="text-[10px] uppercase font-bold tracking-[0.3em] text-outline ml-4">{group.category}</h3>
                 <div className="bg-surface-container-low rounded-3xl border border-white/5 overflow-hidden">
                    {group.items.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} onClick={() => onAction(`设置已更新: ${item.label}`)} className={`flex items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-all ${i !== group.items.length - 1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-4">
                             <Icon size={20} className="text-primary" />
                             <span className="font-bold text-sm text-on-surface">{item.label}</span>
                          </div>
                          {typeof item.value === 'boolean' ? (
                              <div className={`w-10 h-5 rounded-full relative transition-all ${item.value ? 'bg-primary' : 'bg-white/10'}`}>
                                 <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.value ? 'left-6' : 'left-1'}`} />
                              </div>
                          ) : (
                              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{String(item.value)}</span>
                          )}
                       </div>
                      );
                    })}
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

export default SettingsScreen;
