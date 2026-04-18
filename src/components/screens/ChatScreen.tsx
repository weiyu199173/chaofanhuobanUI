import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, PlusCircle, Smile, Mic, Send, Image as ImageIcon, FileText as FileIcon, Video, Phone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ChatScreen = ({ onBack }: { onBack: () => void }) => {
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', text: '你好，我是你的数字孪生伙伴 Aura。今天有什么我可以帮你的吗？', type: 'received', time: '14:02' },
    { id: '2', text: '帮我分析一下最近的广场动态。', type: 'sent', time: '14:05' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      type: 'sent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Auto reply for demo
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '正在通过 Transcend 核心网络分析相关语料... 结果即将生成。',
        type: 'received',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      <header className="shrink-0 bg-background/80 backdrop-blur-2xl flex items-center justify-between px-6 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-primary p-1 active:scale-95 transition-transform">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 ring-2 ring-primary/20">
              <img src="https://picsum.photos/seed/aura/100/100" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-headline font-bold text-lg tracking-tight">Aura (Agent Lv.14)</h1>
              <span className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-1 font-bold">
                <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                Active Protocol
              </span>
            </div>
          </div>
        </div>
        <button className="text-primary p-1 active:scale-95 transition-transform"><MoreVertical size={24} /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        <div className="flex justify-center">
          <span className="text-[9px] uppercase tracking-[0.2em] text-outline font-bold">Sync Started • 14:02 UTC</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'} gap-2 max-w-[85%] ${msg.type === 'sent' ? 'self-end' : 'self-start'}`}>
            <div className={`p-4 rounded-2xl shadow-lg text-sm leading-relaxed ${msg.type === 'sent' ? 'bg-linear-to-br from-primary to-primary-container text-on-primary-container rounded-tr-none font-medium' : 'bg-surface-container-high rounded-tl-none font-light'}`}>
              {msg.text}
            </div>
            <span className={`text-[8px] uppercase font-bold flex items-center gap-1 ${msg.type === 'sent' ? 'text-primary/70 mr-1' : 'text-outline ml-1'}`}>
              {msg.time} {msg.type === 'sent' && <CheckCircle size={10} className="fill-current" />}
            </span>
          </div>
        ))}
      </main>

      <footer className="shrink-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 px-6 py-6 pb-8">
        <AnimatePresence>
          {isMediaMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="max-w-4xl mx-auto overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-4 px-2 py-4 rounded-2xl bg-surface-container-low/40 border border-white/5">
                {[
                  { icon: ImageIcon, label: '图片' },
                  { icon: FileIcon, label: '文件' },
                  { icon: Video, label: '视频' },
                  { icon: Phone, label: '通话' },
                ].map(item => (
                  <button key={item.label} className="flex flex-col items-center gap-2 group outline-none">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-active:scale-95 transition-all border border-white/5 group-hover:border-primary/50 group-hover:bg-primary/5">
                      <item.icon size={24} />
                    </div>
                    <span className="text-[9px] text-outline uppercase tracking-wider font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto flex items-end gap-4 px-2">
          <button 
            onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-90 transition-all mb-1 outline-none ${isMediaMenuOpen ? 'rotate-0' : 'rotate-45'}`}
          >
            <PlusCircle size={22} />
          </button>
          
          <div className="flex-1 relative">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-3 px-4 rounded-t-xl transition-all outline-none" 
              placeholder="发送消息..." 
              type="text"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3 text-outline">
              <Smile size={20} className="hover:text-primary transition-colors cursor-pointer" />
              <Mic size={20} className="hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          <button 
            onClick={handleSend}
            className="w-12 h-12 shrink-0 flex items-center justify-center rounded-full bg-linear-to-r from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 active:scale-90 transition-all mb-1 outline-none"
          >
            <Send size={24} className="fill-current" />
          </button>
        </div>
        <div className="h-1 w-20 bg-surface-container-highest/50 rounded-full mx-auto mt-6" />
      </footer>
    </motion.div>
  );
};
