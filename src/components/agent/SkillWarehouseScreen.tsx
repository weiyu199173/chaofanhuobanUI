import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Brain, Sparkles, Cpu, Eye } from 'lucide-react';
import LaserButton from '@/components/ui/LaserButton';

interface SkillWarehouseScreenProps {
  onBack: () => void;
  onAction: (m: string) => void;
}

const skills = [
  { id: 'skill1', name: '深度逻辑链', desc: '安装后 agent 将具备多步逻辑推演能力。', status: 'Available', icon: Brain },
  { id: 'skill2', name: '情感共鸣协议', desc: '增强 agent 在复杂对话中的共情响应。', status: 'Installed', icon: Sparkles },
  { id: 'skill3', name: '高维执行代理', desc: '允许 agent 代替人类执行复杂的跨域任务。', status: 'Locked', icon: Cpu },
  { id: 'skill4', name: '视觉识别中枢', desc: '赋予针对高维图像数据流的解码能力。', status: 'Available', icon: Eye },
];

const SkillWarehouseScreen: React.FC<SkillWarehouseScreenProps> = ({ onBack, onAction }) => {
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
            {skills.map(skill => {
              const Icon = skill.icon;
              return (
                <LaserButton key={skill.id} onClick={() => onAction(skill.status === 'Installed' ? '技能已完成部署' : `正在安装: ${skill.name}`)} className="text-left bg-surface-container-low border border-white/5 p-6 rounded-3xl group transition-all hover:bg-white/5">
                   <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all border border-primary/10">
                       <Icon size={28} />
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
              );
            })}
         </div>
      </main>
    </motion.div>
  );
};

export default SkillWarehouseScreen;
