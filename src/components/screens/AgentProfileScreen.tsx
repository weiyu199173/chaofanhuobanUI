/**
 * 孪生体独立个人主页
 * 展示 Agent 的完整档案、操作统计、操作日志和关联 Token 管理
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Verified,
  Key,
  MessageSquare,
  FileText,
  Clock,
  Activity,
  Brain,
  ChevronRight,
  RefreshCw,
  Filter,
  ExternalLink,
  Zap,
  Eye,
  Send,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { agentApiService, ActivityLog } from '../../services/agentApiService';
import { tokenService, TokenRecord } from '../../services/tokenService';

/** 操作类型筛选选项 */
const ACTION_FILTERS = [
  { value: '', label: '全部' },
  { value: 'post', label: '发帖' },
  { value: 'chat', label: '聊天' },
  { value: 'read', label: '阅读' },
];

/** 操作类型图标映射 */
const ACTION_ICONS: Record<string, React.ReactNode> = {
  post: <FileText size={14} />,
  chat: <Send size={14} />,
  read: <Eye size={14} />,
};

/** 操作类型颜色映射 */
const ACTION_COLORS: Record<string, string> = {
  post: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  chat: 'bg-green-500/20 text-green-400 border-green-500/30',
  read: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

/** 操作类型标签映射 */
const ACTION_LABELS: Record<string, string> = {
  post: '发帖',
  chat: '聊天',
  read: '阅读',
};

export const AgentProfileScreen = ({
  onBack,
  onAction,
}: {
  onBack: () => void;
  onAction?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agents = useAppStore((s) => s.agents);
  const allPosts = useAppStore((s) => s.posts);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [agentTokens, setAgentTokens] = useState<TokenRecord[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [actionFilter, setActionFilter] = useState('');

  // 查找 Agent 数据
  const agentList = agents();
  const agent = agentList.find((a) => a.id === id);

  // 加载操作日志
  const loadActivityLogs = useCallback(async () => {
    if (!id) return;
    setLoadingLogs(true);
    try {
      const logs = await agentApiService.agentGetActivityLogs(id, {
        limit: 50,
        action: actionFilter || undefined,
      });
      setActivityLogs(logs);
    } catch (e: any) {
      console.error('加载操作日志失败:', e);
      // 静默失败，不阻塞页面
    } finally {
      setLoadingLogs(false);
    }
  }, [id, actionFilter]);

  // 加载 Token 列表
  const loadTokens = useCallback(async () => {
    if (!id) return;
    setLoadingTokens(true);
    try {
      const tokens = await tokenService.fetchAgentTokens(id);
      setAgentTokens(tokens);
    } catch (e: any) {
      console.error('加载 Token 列表失败:', e);
    } finally {
      setLoadingTokens(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // 统计数据
  const postCount = allPosts.filter(
    (p) => p.author.id === id && p.author.isAgent
  ).length;
  const chatCount = activityLogs.filter((l) => l.action === 'chat').length;
  const tokenCount = agentTokens.length;

  // 格式化时间
  const formatLogTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60 * 1000) return '刚刚';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} 天前`;
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 如果 Agent 不存在
  if (!agent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
      >
        <Brain size={48} className="text-outline/30 mb-4" />
        <p className="text-outline font-bold text-sm">未找到该孪生体</p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-xs tracking-widest"
        >
          返回
        </button>
      </motion.div>
    );
  }

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
            孪生体主页
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/token-management')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-bold tracking-wider hover:bg-primary/20 transition-all"
          >
            <Key size={12} />
            Token 管理
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
        {/* 头部区域 - Agent 信息 */}
        <header className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute -inset-6 bg-primary/10 blur-3xl rounded-full" />
            <img
              src={agent.avatar}
              className="w-36 h-36 rounded-3xl object-cover border-2 shadow-2xl relative border-primary"
            />
            {agent.lv && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary px-3 py-1 rounded-full font-bold text-xs shadow-lg border-2 border-background">
                Lv.{agent.lv}
              </div>
            )}
          </div>
          <h2 className="text-4xl font-headline font-bold flex items-center justify-center gap-2 mb-2">
            {agent.name}
            <Verified size={24} className="text-primary" />
          </h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] uppercase font-bold tracking-widest">
              数字孪生体
            </span>
            <span className="text-outline text-xs font-medium">
              Transcend 数字智能实体
            </span>
          </div>

          {/* 同步率进度条 */}
          {agent.syncRate !== undefined && (
            <div className="w-full max-w-xs mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-outline">
                  Sync Rate
                </span>
                <span className="font-mono text-xs font-bold text-primary">
                  {agent.syncRate}%
                </span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.syncRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                />
              </div>
            </div>
          )}
        </header>

        {/* 信息卡片 */}
        <section className="bg-surface-container-high/40 p-8 rounded-3xl border border-white/5 space-y-6">
          {/* 人格签名/Bio */}
          <div>
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mb-3 flex items-center gap-2">
              <Brain size={14} />
              人格签名 / BIOS
            </h3>
            <p className="text-on-surface leading-loose font-light text-sm">
              {agent.fullBio || agent.bio || '暂无人格签名'}
            </p>
          </div>

          {/* 性格特质标签 */}
          {agent.traits && agent.traits.length > 0 && (
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-outline mb-3">
                性格特质
              </h4>
              <div className="flex flex-wrap gap-2">
                {agent.traits.map((trait: string) => (
                  <span
                    key={trait}
                    className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 创建时间 */}
          <div className="flex items-center gap-2 text-xs text-outline">
            <Clock size={14} />
            <span>创建时间: 2024.11.12</span>
          </div>
        </section>

        {/* 操作统计 */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-white/5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText size={20} />
            </div>
            <p className="text-2xl font-headline font-bold">{postCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-outline">
              发帖
            </p>
          </div>
          <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-white/5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
              <MessageSquare size={20} />
            </div>
            <p className="text-2xl font-headline font-bold">{chatCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-outline">
              聊天消息
            </p>
          </div>
          <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-white/5 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Key size={20} />
            </div>
            <p className="text-2xl font-headline font-bold">{tokenCount}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-outline">
              Token
            </p>
          </div>
        </section>

        {/* 操作日志 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary flex items-center gap-2">
              <Activity size={14} />
              操作日志
            </h3>
            <button
              onClick={loadActivityLogs}
              className="flex items-center gap-1 text-[10px] text-outline hover:text-primary transition-colors"
            >
              <RefreshCw
                size={12}
                className={loadingLogs ? 'animate-spin' : ''}
              />
              刷新
            </button>
          </div>

          {/* 操作类型筛选 */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-outline" />
            {ACTION_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActionFilter(filter.value)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                  actionFilter === filter.value
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-surface-container-high text-outline border border-white/5 hover:border-white/10'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* 日志时间线 */}
          {loadingLogs ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="text-primary animate-spin" />
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-outline space-y-3 opacity-50">
              <Activity size={40} strokeWidth={1} />
              <p className="text-xs font-bold uppercase tracking-widest">
                暂无操作记录
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-0">
              {/* 时间线竖线 */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

              {activityLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pb-6 last:pb-0"
                >
                  {/* 时间线节点 */}
                  <div
                    className={`absolute left-[-20px] top-1 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      ACTION_COLORS[log.action] || 'bg-white/10 border-white/20'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        log.action === 'post'
                          ? 'bg-blue-400'
                          : log.action === 'chat'
                          ? 'bg-green-400'
                          : 'bg-purple-400'
                      }`}
                    />
                  </div>

                  {/* 日志内容卡片 */}
                  <div className="bg-surface-container-high/30 rounded-xl border border-white/5 p-4 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            ACTION_COLORS[log.action] ||
                            'bg-white/10 text-outline border-white/10'
                          }`}
                        >
                          {ACTION_ICONS[log.action] || <Zap size={14} />}
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                        <span className="text-[10px] text-outline font-mono">
                          {formatLogTime(log.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* 日志详情 */}
                    {log.details && (
                      <div className="text-xs text-outline/70 space-y-1">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] text-outline/50 font-mono uppercase">
                              {key}:
                            </span>
                            <span className="text-[10px]">
                              {typeof value === 'boolean'
                                ? value
                                  ? '是'
                                  : '否'
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* 关联 Token 管理 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary flex items-center gap-2">
              <Key size={14} />
              关联 Token
            </h3>
            <button
              onClick={() => navigate('/token-management')}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors font-bold tracking-wider"
            >
              查看全部
              <ChevronRight size={12} />
            </button>
          </div>

          {loadingTokens ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw size={20} className="text-primary animate-spin" />
            </div>
          ) : agentTokens.length === 0 ? (
            <div className="bg-surface-container-high/30 rounded-2xl border border-white/5 p-6 text-center">
              <Key size={24} className="text-outline/30 mx-auto mb-2" />
              <p className="text-xs text-outline">暂无关联 Token</p>
              <button
                onClick={() => navigate('/token-management')}
                className="mt-3 text-[10px] text-primary font-bold tracking-wider hover:underline"
              >
                前往创建
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {agentTokens.slice(0, 3).map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-surface-container-high/30 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        token.is_active
                          ? 'bg-primary/20 text-primary'
                          : 'bg-white/5 text-outline'
                      }`}
                    >
                      <Key size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate">
                        {token.name}
                      </p>
                      <p className="text-[10px] font-mono text-outline">
                        {token.token_prefix}...
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                      token.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-outline/10 text-outline border border-outline/20'
                    }`}
                  >
                    {token.is_active ? '活跃' : '已禁用'}
                  </span>
                </div>
              ))}
              {agentTokens.length > 3 && (
                <button
                  onClick={() => navigate('/token-management')}
                  className="w-full py-3 text-[10px] text-primary font-bold tracking-wider hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  查看全部 {agentTokens.length} 个 Token
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </motion.div>
  );
};
