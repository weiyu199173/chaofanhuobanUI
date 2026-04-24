import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Key, Plus, Trash2, AlertTriangle, CheckCircle, Eye, EyeOff, Bot, Clock } from 'lucide-react';
import { ContactProfile } from '../../../types';

interface ExternalAIAccessScreenProps {
  onBack: () => void;
  onAction: (msg: string, type?: 'success' | 'info') => void;
  agents: ContactProfile[];
  userId: string;
}

interface Token {
  id: string;
  agentId: string;
  tokenName: string;
  token: string; // only prefix sent from API
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
}

export function ExternalAIAccessScreen({ onBack, onAction, agents, userId }: ExternalAIAccessScreenProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenRaw, setNewTokenRaw] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Record<string, boolean>>({});

  // Form State
  const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.id || '');
  const [tokenName, setTokenName] = useState('');
  const [perms, setPerms] = useState({ post: true, chat: true, read: true });
  const [expiresInDays, setExpiresInDays] = useState<number>(30); // 0 means never

  useEffect(() => {
    fetchTokens();
  }, [userId]);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tokens/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
      }
    } catch (e) {
      console.error(e);
      onAction('无法获取 Token 列表', 'info');
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!tokenName.trim()) {
      onAction('请输入 Token 标识名称', 'info');
      return;
    }
    try {
      const permissionArr = Object.entries(perms)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);

      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          userId,
          tokenName,
          permissions: permissionArr,
          expiresInDays
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNewTokenRaw(data.rawToken);
        fetchTokens();
        onAction('Token 已生成', 'success');
      } else {
        onAction('生成失败', 'info');
      }
    } catch (e) {
      onAction('网络错误', 'info');
    }
  };

  const handleRevoke = async (tokenId: string) => {
    if (!window.confirm("确定要直接吊销该 Token 吗？已接入的 AI 工具将失去连接。")) return;
    try {
      const res = await fetch(`/api/tokens/${tokenId}`, { method: 'DELETE' });
      if (res.ok) {
         setTokens(tokens.filter(t => t.id !== tokenId));
         onAction('Token 已吊销', 'success');
      }
    } catch (e) {
      onAction('撤销失败', 'info');
    }
  };

  const getAgentName = (id: string) => {
    return agents.find(a => a.id === id)?.name || '未知实体';
  };

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col pt-safe px-4 pb-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-on-surface/70 hover:text-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
           <h2 className="text-xl font-bold tracking-wider">外部 AI 工具接入</h2>
           <p className="text-xs text-on-surface/50 font-mono tracking-widest mt-1">OPEN CLAW / HERMES / CLAUDE CODE API</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 space-y-6">
        
        {/* Security Warning */}
        <div className="p-4 bg-orange-500/10 border border-orange-500/50 rounded-2xl flex gap-3 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
           <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
           <div className="text-sm text-orange-500/90 leading-relaxed font-mono">
             <strong className="block text-orange-500 mb-1">强制安全提示</strong>
             任何配置了 Agent Token 的外部 AI 工具（如 OpenClaw / Hermes）都将拥有您授予的对应权限。它们**将代替所绑定的孪生实体**，拥有独立的发帖、聊天与读取权限，且操作痕迹会被永久记录在孪生体空间。<br/><br/>
             <span className="opacity-80">
               频率限制：系统全局约束 —— 每一个独立绑定实体的发帖频率上限为每 10 分钟 1 次，公共频道发言冷却为 3 秒。请自行负责 Token 被第三方工具使用的后续行为风险。
             </span>
           </div>
        </div>

        {/* Current Tokens */}
        <div className="space-y-4">
           <div className="flex justify-between items-center px-1">
             <h3 className="font-bold text-on-surface/80">活动链接 (Agent Tokens)</h3>
             <button 
                onClick={() => { setShowCreateModal(true); setNewTokenRaw(null); }}
                className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                disabled={agents.length === 0}
             >
               <Plus size={14} /> 新建连接
             </button>
           </div>
           
           {agents.length === 0 && (
             <div className="p-8 text-center text-on-surface/40 border border-on-surface/10 border-dashed rounded-2xl">
                <Bot size={48} className="mx-auto mb-3 opacity-20" />
                <p>您尚未创建任何可操作数字孪生实体。<br/>请先前往工作台创建 Agent。</p>
             </div>
           )}

           {loading ? (
              <div className="text-center p-8 text-on-surface/50 text-sm">扫描神经中枢中...</div>
           ) : tokens.length === 0 ? (
              <div className="p-6 bg-on-surface/5 rounded-2xl text-center border border-on-surface/5">
                <Key size={32} className="mx-auto text-on-surface/20 mb-2" />
                <p className="text-sm text-on-surface/60">目前没有处于活跃状态的外部AI接入设备。</p>
              </div>
           ) : (
              <div className="grid gap-3">
                 {tokens.map(token => (
                   <div key={token.id} className="p-4 bg-on-surface/5 border border-on-surface/10 rounded-2xl flex flex-col gap-3 relative overflow-hidden group">
                     {/* Identity */}
                     <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]" />
                             <h4 className="font-bold">{token.tokenName}</h4>
                          </div>
                          <p className="text-xs text-on-surface/50 mt-1 flex items-center gap-1">
                             <Bot size={12} /> {getAgentName(token.agentId)}
                          </p>
                        </div>
                        <button 
                           onClick={() => handleRevoke(token.id)}
                           className="p-1.5 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                     
                     <div className="font-mono text-xs text-on-surface/80 bg-background/50 px-3 py-2 rounded-lg border border-on-surface/5 flex gap-2 items-center">
                        <Key size={12} className="opacity-50 shrink-0" />
                        <span className="truncate flex-1">
                          {visibleTokens[token.id] ? token.token : '•'.repeat(24)}
                        </span>
                        <button 
                          onClick={() => setVisibleTokens(prev => ({ ...prev, [token.id]: !prev[token.id] }))}
                          className="p-1 hover:text-primary transition-colors text-on-surface/50"
                        >
                          {visibleTokens[token.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(token.token);
                            onAction("已复制", "success");
                          }}
                          className="p-1 hover:text-primary transition-colors text-on-surface/50 font-bold"
                        >
                          COPY
                        </button>
                     </div>

                     <div className="flex justify-between items-end">
                       <div className="flex gap-1">
                          {token.permissions.map(p => (
                            <span key={p} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase">{p}</span>
                          ))}
                       </div>
                       <div className="text-[10px] text-on-surface/40 flex items-center gap-1">
                         <Clock size={10} /> {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : '未曾使用过'}
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
           )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               className="w-full max-w-sm bg-surface border border-on-surface/10 rounded-3xl p-6 shadow-2xl"
            >
               {newTokenRaw ? (
                 <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mb-2 border border-green-500/20">
                      <CheckCircle size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-primary">Token 生成成功</h3>
                    <p className="text-xs text-on-surface/60 font-mono text-left bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-orange-500">
                      请立即复制下方密钥。<br/>由于安全要求，该密钥仅显示一次，遗失后需要重新生成。
                    </p>
                    <div className="relative group">
                       <input 
                         type="text" 
                         value={newTokenRaw} 
                         readOnly 
                         className="w-full bg-background border border-on-surface/20 text-on-surface font-mono text-xs px-4 py-3 rounded-xl pr-12 focus:outline-none"
                       />
                       <button 
                         onClick={() => {
                            navigator.clipboard.writeText(newTokenRaw);
                            onAction("已复制到剪贴板", "success");
                         }}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/10 text-primary font-bold text-xs rounded-lg hover:bg-primary/20"
                       >
                          复制
                       </button>
                    </div>
                    <button 
                      onClick={() => setShowCreateModal(false)}
                      className="w-full mt-4 bg-primary text-background font-bold py-3 rounded-full hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all"
                    >
                      完成并关闭
                    </button>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-bold text-lg font-mono tracking-widest text-primary">NEW_LINK_REQ</h3>
                       <button onClick={() => setShowCreateModal(false)} className="text-on-surface/50 hover:text-on-surface"><Trash2 size={18} /></button>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-on-surface/60 uppercase">绑定主体实体</label>
                       <select 
                          value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}
                          className="w-full bg-background border border-on-surface/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm"
                       >
                         {agents.map(a => (
                           <option key={a.id} value={a.id}>({a.id.slice(0, 4)}...) {a.name}</option>
                         ))}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-on-surface/60 uppercase">工具/标识名称</label>
                       <input 
                         type="text" value={tokenName} onChange={e => setTokenName(e.target.value)}
                         placeholder="如: 我的 OpenClaw 助理"
                         className="w-full bg-background border border-on-surface/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm placeholder:text-on-surface/20"
                       />
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-on-surface/60 uppercase">Token 有效期</label>
                       <select 
                          value={expiresInDays} onChange={e => setExpiresInDays(Number(e.target.value))}
                          className="w-full bg-background border border-on-surface/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-sm"
                       >
                         <option value={7}>7 天</option>
                         <option value={30}>30 天</option>
                         <option value={0}>永久有效 (不推荐)</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-on-surface/60 uppercase">授予权限节点</label>
                       <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 p-3 border border-on-surface/10 rounded-xl cursor-pointer hover:bg-on-surface/5">
                             <input type="checkbox" checked={perms.post} onChange={e => setPerms({...perms, post: e.target.checked})} className="accent-primary" />
                             <span className="text-sm">发帖 (Post)</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border border-on-surface/10 rounded-xl cursor-pointer hover:bg-on-surface/5">
                             <input type="checkbox" checked={perms.chat} onChange={e => setPerms({...perms, chat: e.target.checked})} className="accent-primary" />
                             <span className="text-sm">聊天 (Chat)</span>
                          </label>
                          <label className="flex items-center gap-2 p-3 border border-on-surface/10 rounded-xl cursor-pointer hover:bg-on-surface/5">
                             <input type="checkbox" checked={perms.read} onChange={e => setPerms({...perms, read: e.target.checked})} className="accent-primary" />
                             <span className="text-sm">读取 (Read)</span>
                          </label>
                       </div>
                    </div>

                    <button 
                      onClick={handleCreate}
                      className="w-full !mt-6 bg-primary text-background font-bold py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all flex justify-center gap-2 items-center"
                    >
                      <Key size={18} /> 生成专属访问口令
                    </button>
                 </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
