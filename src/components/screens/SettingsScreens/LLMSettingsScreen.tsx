import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Key, Cpu, Save, Database, Globe } from 'lucide-react';

export const LLMSettingsScreen = ({ onBack, onAction }: { onBack: () => void, onAction: (m: string, t?: 'success' | 'info') => void }) => {
  const [llmConfig, setLlmConfig] = useState({
    provider: 'openai',
    baseUrl: '',
    apiKey: '',
    model: 'gpt-4o'
  });

  useEffect(() => {
    const saved = localStorage.getItem('user_llm_config');
    if (saved) {
      try {
        setLlmConfig(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('user_llm_config', JSON.stringify(llmConfig));
    onAction('本地 LLM 代理密钥保存成功，数字孪生接管功能已就绪!', 'success');
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[110] bg-background flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all text-outline">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-on-surface">LLM 大模型密钥</h1>
        </div>
      </header>
      
      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar pb-32">
         <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-surface-container-low/50 p-6 rounded-3xl border border-white/5 space-y-3">
               <Cpu size={24} className="text-primary mb-2" />
               <p className="text-xs text-outline leading-relaxed select-none">
                 在此配置你的专属大语言模型参数。配置后，您的「数字孪生体」以及自建的 Agents 将通过您的 API Key 真正具备理解长文本、总结上下文和自动回复私信的能力。数据直接从本地连线，安全且私密。
               </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1 flex items-center gap-2">
                      <Database size={12} /> 供应商平台 / Provider
                   </label>
                   <select 
                      value={llmConfig.provider} 
                      onChange={e => setLlmConfig({...llmConfig, provider: e.target.value})}
                      className="w-full bg-surface-container-high border-none focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all"
                   >
                     <option value="openai">OpenAI 兼容 (DeepSeek/月之暗面等)</option>
                     <option value="anthropic">Anthropic (Claude)</option>
                     <option value="gemini">Google Gemini</option>
                     <option value="ollama">Ollama (本地私有化)</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1 flex items-center gap-2">
                      <Globe size={12} /> 代理地址 / Base URL (可选)
                   </label>
                   <input 
                      type="text" 
                      value={llmConfig.baseUrl}
                      onChange={e => setLlmConfig({...llmConfig, baseUrl: e.target.value})}
                      placeholder="如: https://api.deepseek.com/v1"
                      className="w-full bg-surface-container-high border-none focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all font-mono placeholder:text-outline/30"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1 flex items-center gap-2">
                      <Key size={12} /> 密钥 / API Key
                   </label>
                   <input 
                      type="password" 
                      value={llmConfig.apiKey}
                      onChange={e => setLlmConfig({...llmConfig, apiKey: e.target.value})}
                      placeholder="sk-..."
                      className="w-full bg-surface-container-high border-none focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all font-mono placeholder:text-outline/30"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-primary ml-1 flex items-center gap-2">
                      <Cpu size={12} /> 首选模型 / Primary Model
                   </label>
                   <input 
                      type="text" 
                      value={llmConfig.model}
                      onChange={e => setLlmConfig({...llmConfig, model: e.target.value})}
                      placeholder="如: deepseek-chat 或 gpt-4o"
                      className="w-full bg-surface-container-high border-none focus:ring-0 rounded-xl px-5 py-4 text-sm font-medium transition-all font-mono placeholder:text-outline/30"
                   />
                </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-background font-bold tracking-widest text-sm uppercase mt-8 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              <Save size={18} />
              保存配置与激活数字孪生
            </button>
         </div>
      </main>
    </motion.div>
  );
};
