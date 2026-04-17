import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Target, Plus, ShoppingBag } from 'lucide-react';
import LaserButton from '@/components/ui/LaserButton';

interface MCPMarketScreenProps {
  onBack: () => void;
  onAction: (m: string) => void;
}

const items = [
  { name: '量子加密包', price: '450 NCC', category: 'Security' },
  { name: '通感协议 2.0', price: '1200 NCC', category: 'Comm' },
  { name: '时空锚定器', price: '800 NCC', category: 'Logic' },
  { name: '混沌算力流', price: '2100 NCC', category: 'Compute' },
];

const MCPMarketScreen: React.FC<MCPMarketScreenProps> = ({ onBack, onAction }) => {
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
               {items.map(item => (
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

export default MCPMarketScreen;
