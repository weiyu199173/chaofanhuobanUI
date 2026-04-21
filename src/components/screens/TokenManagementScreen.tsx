/**
 * Token 管理页面
 * 管理 Agent Token 的完整生命周期：创建、查看、禁用、删除
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Ban,
  ToggleLeft,
  ToggleRight,
  X,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { tokenService, TokenRecord } from '../../services/tokenService';
import { supabase } from '../../lib/supabase';

/** 权限配置 */
interface PermissionConfig {
  post: boolean;
  chat: boolean;
  read: boolean;
}

/** 有效期选项 */
type ExpiryOption = 'never' | '7d' | '30d' | '90d';

/** 有效期选项映射 */
const EXPIRY_OPTIONS: { value: ExpiryOption; label: string; seconds: number | null }[] = [
  { value: 'never', label: '永不过期', seconds: null },
  { value: '7d', label: '7 天', seconds: 7 * 24 * 3600 },
  { value: '30d', label: '30 天', seconds: 30 * 24 * 3600 },
  { value: '90d', label: '90 天', seconds: 90 * 24 * 3600 },
];

/** 操作类型标签映射 */
const ACTION_LABELS: Record<string, string> = {
  post: '发帖',
  chat: '聊天',
  read: '阅读',
};

export const TokenManagementScreen = ({
  onBack,
  onAction,
}: {
  onBack: () => void;
  onAction?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) => {
  const agents = useAppStore((s) => s.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 创建 Token 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenPermissions, setNewTokenPermissions] = useState<PermissionConfig>({
    post: false,
    chat: true,
    read: true,
  });
  const [newTokenExpiry, setNewTokenExpiry] = useState<ExpiryOption>('30d');
  const [creating, setCreating] = useState(false);

  // 创建成功后展示完整 Token
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 二次确认状态
  const [confirmAction, setConfirmAction] = useState<{
    type: 'disable' | 'enable' | 'delete';
    tokenId: string;
    tokenName: string;
  } | null>(null);

  // 初始化选中第一个 Agent
  useEffect(() => {
    const agentList = agents();
    if (agentList.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agentList[0].id);
    }
  }, [agents, selectedAgentId]);

  // 加载 Token 列表
  const loadTokens = useCallback(async () => {
    if (!selectedAgentId) return;
    setLoading(true);
    try {
      const data = await tokenService.fetchAgentTokens(selectedAgentId);
      setTokens(data);
    } catch (e: any) {
      console.error('加载 Token 列表失败:', e);
      onAction?.('加载 Token 列表失败: ' + e.message, 'info');
    } finally {
      setLoading(false);
    }
  }, [selectedAgentId, onAction]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // 切换 Agent 时重新加载
  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
    setCreatedToken(null);
  };

  // 创建 Token
  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      onAction?.('请输入 Token 名称', 'info');
      return;
    }
    if (!selectedAgentId) return;

    setCreating(true);
    try {
      const expiryOption = EXPIRY_OPTIONS.find((o) => o.value === newTokenExpiry);
      const result = await tokenService.generateToken(selectedAgentId, {
        name: newTokenName.trim(),
        permissions: newTokenPermissions,
        expiresIn: expiryOption?.seconds ?? 30 * 24 * 3600,
      });
      setCreatedToken(result.token);
      setNewTokenName('');
      setNewTokenPermissions({ post: false, chat: true, read: true });
      setNewTokenExpiry('30d');
      setShowCreateModal(false);
      loadTokens();
      onAction?.('Token 创建成功，请妥善保管', 'success');
    } catch (e: any) {
      onAction?.('创建 Token 失败: ' + e.message, 'info');
    } finally {
      setCreating(false);
    }
  };

  // 禁用/启用 Token
  const handleToggleToken = async (tokenId: string) => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'disable') {
        await tokenService.deactivateToken(tokenId);
        onAction?.('Token 已禁用', 'success');
      } else {
        // 启用 - 需要更新 is_active 为 true
        const { error } = await supabase
          .from('agent_tokens')
          .update({ is_active: true })
          .eq('id', tokenId);
        if (error) throw new Error(error.message);
        onAction?.('Token 已启用', 'success');
      }
      loadTokens();
    } catch (e: any) {
      onAction?.('操作失败: ' + e.message, 'info');
    } finally {
      setConfirmAction(null);
    }
  };

  // 删除 Token
  const handleDeleteToken = async (tokenId: string) => {
    if (!confirmAction) return;
    try {
      await tokenService.deleteToken(tokenId);
      onAction?.('Token 已永久删除', 'success');
      loadTokens();
    } catch (e: any) {
      onAction?.('删除失败: ' + e.message, 'info');
    } finally {
      setConfirmAction(null);
    }
  };

  // 复制 Token
  const handleCopyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = createdToken;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '从未使用';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  };

  const formatCreatedTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 检查是否过期
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const agentList = agents();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto custom-scrollbar"
    >
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-surface-container-high transition-all outline-none"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-headline tracking-[0.2em] text-xl font-bold uppercase">
            Token 管理
          </h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-xs tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          生成新 Token
        </button>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* 安全警告区域 */}
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <AlertTriangle size={80} />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Shield size={18} className="text-red-400" />
            </div>
            <h3 className="font-bold text-sm text-red-400 tracking-wide">
              安全提示
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-red-300/80 leading-relaxed relative z-10">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">&#x2022;</span>
              任何配置了该 Token 的 AI 工具都可以您的孪生体身份操作 App（发帖、聊天、阅读），请确保您信任该 AI 工具的行为
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">&#x2022;</span>
              请勿将 Token 分享给不可信任的第三方，定期检查并轮换 Token
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">&#x2022;</span>
              如发现异常操作，请立即禁用或删除该 Token
            </li>
          </ul>
        </div>

        {/* Agent 选择器 */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest text-outline font-bold font-headline">
            选择 Agent
          </label>
          <div className="relative">
            <select
              value={selectedAgentId}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm focus:ring-1 focus:ring-primary appearance-none outline-none cursor-pointer"
            >
              {agentList.length === 0 && (
                <option value="">暂无 Agent</option>
              )}
              {agentList.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* 创建成功后展示完整 Token（仅一次） */}
        <AnimatePresence>
          {createdToken && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-500/10 border border-amber-500/50 rounded-2xl p-6 space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Key size={80} />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  <h3 className="font-bold text-sm text-amber-400">
                    Token 创建成功 - 请立即保存
                  </h3>
                </div>
                <button
                  onClick={() => setCreatedToken(null)}
                  className="text-outline hover:text-on-surface transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-amber-300/70 relative z-10">
                此 Token 仅显示一次，关闭后将无法再次查看。请立即复制并妥善保管。
              </p>
              <div className="bg-background/60 rounded-xl p-4 flex items-center gap-3 relative z-10">
                <code className="flex-1 text-xs font-mono text-amber-300 break-all leading-relaxed">
                  {createdToken}
                </code>
                <button
                  onClick={handleCopyToken}
                  className={`shrink-0 p-2 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token 列表 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary flex items-center gap-2">
              <Key size={14} />
              Token 列表
            </h3>
            <button
              onClick={loadTokens}
              className="flex items-center gap-1 text-[10px] text-outline hover:text-primary transition-colors"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              刷新
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="text-primary animate-spin" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-outline space-y-4 opacity-50">
              <Key size={48} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">
                暂无 Token
              </p>
              <p className="text-xs">点击上方按钮生成第一个 Token</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => {
                const expired = isExpired(token.expires_at);
                return (
                  <motion.div
                    key={token.id}
                    layout
                    className="bg-surface-container-high/40 rounded-2xl border border-white/5 p-5 space-y-4 hover:border-white/10 transition-all"
                  >
                    {/* Token 头部信息 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            token.is_active && !expired
                              ? 'bg-primary/20 text-primary'
                              : 'bg-white/5 text-outline'
                          }`}
                        >
                          <Key size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm truncate">
                              {token.name}
                            </p>
                            <span
                              className={`shrink-0 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                                token.is_active && !expired
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : expired
                                  ? 'bg-outline/10 text-outline border border-outline/20'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {expired
                                ? '已过期'
                                : token.is_active
                                ? '活跃'
                                : '已禁用'}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-outline mt-0.5">
                            {token.token_prefix}...
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 权限标签 */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(token.permissions || {}).map(
                        ([key, value]) =>
                          value ? (
                            <span
                              key={key}
                              className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                              {ACTION_LABELS[key] || key}
                            </span>
                          ) : null
                      )}
                    </div>

                    {/* 时间信息 */}
                    <div className="flex items-center gap-4 text-[10px] text-outline">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>创建: {formatCreatedTime(token.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye size={12} />
                        <span>最后使用: {formatTime(token.last_used_at)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 pt-1">
                      {token.is_active ? (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'disable',
                              tokenId: token.id,
                              tokenName: token.name,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold tracking-wider hover:bg-amber-500/20 transition-all"
                        >
                          <Ban size={12} />
                          禁用
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'enable',
                              tokenId: token.id,
                              tokenName: token.name,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold tracking-wider hover:bg-green-500/20 transition-all"
                        >
                          <ToggleRight size={12} />
                          启用
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'delete',
                            tokenId: token.id,
                            tokenName: token.name,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold tracking-wider hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 size={12} />
                        删除
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 创建 Token 弹窗 */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[201] bg-surface rounded-3xl border border-white/10 shadow-2xl shadow-primary/10 overflow-hidden max-w-lg mx-auto"
            >
              <div className="laser-sweep-overlay opacity-20 pointer-events-none" />
              <div className="p-6 space-y-6">
                {/* 弹窗头部 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <Key size={20} />
                    </div>
                    <h2 className="font-headline font-bold text-lg tracking-wide">
                      生成新 Token
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-full hover:bg-white/5 transition-all text-outline"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Token 名称 */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest text-primary font-bold font-headline">
                    Token 名称
                  </label>
                  <input
                    type="text"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="例如：AutoGPT-发帖助手"
                    className="w-full bg-surface-container-high border border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* 权限配置 */}
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest text-primary font-bold font-headline">
                    权限配置
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        { key: 'post', label: '发帖', desc: '允许以 Agent 身份发布帖子' },
                        { key: 'chat', label: '聊天', desc: '允许以 Agent 身份发送消息' },
                        { key: 'read', label: '阅读', desc: '允许读取 Agent 的资料和动态' },
                      ] as const
                    ).map((perm) => (
                      <div
                        key={perm.key}
                        onClick={() =>
                          setNewTokenPermissions((prev) => ({
                            ...prev,
                            [perm.key]: !prev[perm.key],
                          }))
                        }
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-white/5 cursor-pointer hover:border-white/10 transition-all"
                      >
                        <div>
                          <p className="font-bold text-sm">{perm.label}</p>
                          <p className="text-[10px] text-outline mt-0.5">
                            {perm.desc}
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full relative border transition-all ${
                            newTokenPermissions[perm.key]
                              ? 'bg-primary/20 border-primary/50'
                              : 'bg-surface-container-highest border-white/10'
                          }`}
                        >
                          <div
                            className={`absolute top-1 rounded-full w-3 h-3 transition-all ${
                              newTokenPermissions[perm.key]
                                ? 'left-6 bg-primary'
                                : 'left-1 bg-outline'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 有效期选择 */}
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest text-primary font-bold font-headline">
                    有效期
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPIRY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setNewTokenExpiry(opt.value)}
                        className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                          newTokenExpiry === opt.value
                            ? 'bg-primary/10 border-primary/50 text-primary'
                            : 'bg-surface-container-low border-white/5 text-outline hover:border-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 创建按钮 */}
                <button
                  onClick={handleCreateToken}
                  disabled={creating || !newTokenName.trim()}
                  className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      生成 Token
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 二次确认弹窗 */}
      <AnimatePresence>
        {confirmAction && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmAction(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[201] bg-surface rounded-2xl border border-white/10 shadow-2xl p-6 max-w-sm mx-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    confirmAction.type === 'delete'
                      ? 'bg-red-500/20 text-red-400'
                      : confirmAction.type === 'disable'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {confirmAction.type === 'delete' ? (
                    <Trash2 size={20} />
                  ) : confirmAction.type === 'disable' ? (
                    <Ban size={20} />
                  ) : (
                    <ToggleRight size={20} />
                  )}
                </div>
                <h3 className="font-bold text-lg">确认操作</h3>
              </div>
              <p className="text-sm text-outline mb-6">
                {confirmAction.type === 'delete'
                  ? `确定要永久删除 Token "${confirmAction.tokenName}" 吗？此操作不可撤销。`
                  : confirmAction.type === 'disable'
                  ? `确定要禁用 Token "${confirmAction.tokenName}" 吗？禁用后使用该 Token 的 AI 工具将无法操作。`
                  : `确定要启用 Token "${confirmAction.tokenName}" 吗？`}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-3 rounded-xl bg-surface-container-high border border-white/10 text-sm font-bold hover:bg-surface-container-highest transition-all"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (confirmAction.type === 'delete') {
                      handleDeleteToken(confirmAction.tokenId);
                    } else {
                      handleToggleToken(confirmAction.tokenId);
                    }
                  }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    confirmAction.type === 'delete'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : confirmAction.type === 'disable'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                  }`}
                >
                  {confirmAction.type === 'delete'
                    ? '永久删除'
                    : confirmAction.type === 'disable'
                    ? '确认禁用'
                    : '确认启用'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
