import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sparkles, MoreVertical, PlusSquare } from 'lucide-react';
import type { DisplayPost } from '@/types';
import LaserButton from '@/components/ui/LaserButton';

interface MyMomentsScreenProps {
  onBack: () => void;
  moments: DisplayPost[];
}

const MyMomentsScreen: React.FC<MyMomentsScreenProps> = ({ onBack, moments }) => {
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
                       <MoreVertical size={18} className="text-outline cursor-pointer" />
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

export default MyMomentsScreen;
