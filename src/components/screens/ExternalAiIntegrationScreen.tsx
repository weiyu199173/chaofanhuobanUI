import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, Copy, Plus, Trash2, CheckCircle2, Clock, Lock, Shield, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LaserButton } from '../Common';
import { DigitalTwin, AgentToken, UserProfile } from '../../types';
import { DigitalTwinService } from '../../services/digitalTwinService';
import { AgentTokenService } from '../../services/agentTokenService';

interface ExternalAiIntegrationScreenProps {
  onBack: () => void;
  userProfile: UserProfile;
}

export const ExternalAiIntegrationScreen: React.FC<ExternalAiIntegrationScreenProps> = ({ onBack, userProfile }) => {
  const [digitalTwins, setDigitalTwins] = useState<DigitalTwin[]>([]);
  const [selectedTwinId, setSelectedTwinId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<AgentToken[]>([]);
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [showTokenCreatedModal, setShowTokenCreatedModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenPermissions, setNewTokenPermissions] = useState({ read: true, post: false, chat: false });
  const [createdToken, setCreatedToken] = useState<AgentToken | null>(null);
  const [isCreatingToken, setIsCreatingToken] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDigitalTwins();
  }, []);

  useEffect(() => {
    if (selectedTwinId) {
      loadTokens();
    }
  }, [selectedTwinId]);

  const loadDigitalTwins = async () => {
    const twins = await DigitalTwinService.getDigitalTwinsByUser(userProfile.id);
    setDigitalTwins(twins);
    if (twins.length > 0) {
      setSelectedTwinId(twins[0].id);
    }
  };

  const loadTokens = async () => {
    const allTokens = await AgentTokenService.getUserTokens(userProfile.id);
    const twinTokens = allTokens.filter(token => token.twin_id === selectedTwinId);
    setTokens(twinTokens);
  };

  const handleCreateToken = async () => {
    if (!selectedTwinId || !newTokenName.trim()) return;

    setIsCreatingToken(true);
    const token = await AgentTokenService.createToken(
      userProfile.id,
      selectedTwinId,
      newTokenName.trim(),
      newTokenPermissions
    );

    if (token) {
      setCreatedToken(token);
      setShowTokenCreatedModal(true);
      setShowNewTokenModal(false);
      setNewTokenName('');
      await loadTokens();
    }

    setIsCreatingToken(false);
  };

  const handleCopyToken = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    const success = await AgentTokenService.revokeToken(tokenId);
    if (success) {
      await loadTokens();
    }
  };

  const selectedTwin = digitalTwins.find(t => t.id === selectedTwinId);

  return (
    <div className="h-full flex flex-col bg-background pb-32 overflow-hidden relative">
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onBack} className="p-2 rounded-full text-primary">
            <ArrowLeft size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">外部 AI 集成</h1>
        </div>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <ShieldAlert size={20} className="text-error shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-error mb-1">安全警告</h3>
              <p className="text-sm text-error/80">
                请妥善保管您的 API 令牌，不要将其分享给任何人。令牌具有访问您数字孪生的权限，请确保只在信任的环境中使用。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-surface-container-high/40 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-semibold text-on-surface flex items-center gap-2">
                    <Shield size={18} className="text-primary" />
                    选择数字孪生
                  </h3>
                </div>
                <div className="divide-y divide-white/5">
                  {digitalTwins.map(twin => (
                    <button
                      key={twin.id}
                      onClick={() => setSelectedTwinId(twin.id)}
                      className={`w-full p-4 text-left transition-all hover:bg-surface-container-high ${
                        selectedTwinId === twin.id ? 'bg-primary/10 border-l-4 border-primary' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={twin.avatar} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-on-surface">{twin.name}</p>
                          <p className="text-xs text-outline">{twin.is_active ? '活跃' : '未激活'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {digitalTwins.length === 0 && (
                    <div className="p-6 text-center text-outline">
                      <p>暂无数字孪生</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-surface-container-high/40 rounded-xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-on-surface">
                    {selectedTwin ? `${selectedTwin.name} 的 API 令牌` : '令牌管理'}
                  </h3>
                  {selectedTwin && (
                    <LaserButton
                      onClick={() => setShowNewTokenModal(true)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Plus size={16} />
                      创建新令牌
                    </LaserButton>
                  )}
                </div>

                <div className="divide-y divide-white/5">
                  {tokens.map(token => (
                    <div key={token.id} className="p-4 hover:bg-surface-container-high/30 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-on-surface">{token.name}</p>
                            {token.is_active ? (
                              <CheckCircle2 size={14} className="text-green-500" />
                            ) : (
                              <AlertCircle size={14} className="text-outline" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="text-[10px] px-2 py-0.5 bg-surface-container-highest rounded text-outline">
                              {token.permissions.read ? '读取' : ''}
                              {token.permissions.post ? ', 发布' : ''}
                              {token.permissions.chat ? ', 聊天' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-outline">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              到期: {new Date(token.expires_at).toLocaleDateString('zh-CN')}
                            </span>
                            {token.last_used_at && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                最后使用: {new Date(token.last_used_at).toLocaleDateString('zh-CN')}
                              </span>
                            )}
                          </div>
                        </div>
                        {token.is_active && (
                          <button
                            onClick={() => handleRevokeToken(token.id)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {tokens.length === 0 && selectedTwin && (
                    <div className="p-8 text-center">
                      <Lock size={32} className="mx-auto text-outline mb-3" />
                      <p className="text-outline mb-4">暂无 API 令牌</p>
                      <p className="text-xs text-outline/70 mb-4">创建一个令牌来授权外部 AI 访问您的数字孪生</p>
                    </div>
                  )}
                  {!selectedTwin && (
                    <div className="p-8 text-center">
                      <Shield size={32} className="mx-auto text-outline mb-3" />
                      <p className="text-outline">请先选择一个数字孪生</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showNewTokenModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewTokenModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-background rounded-2xl border border-white/10 max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-on-surface">创建新令牌</h3>
                <button
                  onClick={() => setShowNewTokenModal(false)}
                  className="p-2 text-outline hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">令牌名称</label>
                  <input
                    type="text"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="例如：我的聊天机器人"
                    className="w-full bg-surface-container-highest border border-white/10 rounded-lg px-3 py-2 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">权限</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTokenPermissions.read}
                        onChange={(e) => setNewTokenPermissions({ ...newTokenPermissions, read: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-surface-container-highest text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">读取动态</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTokenPermissions.post}
                        onChange={(e) => setNewTokenPermissions({ ...newTokenPermissions, post: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-surface-container-highest text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">发布动态</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTokenPermissions.chat}
                        onChange={(e) => setNewTokenPermissions({ ...newTokenPermissions, chat: e.target.checked })}
                        className="w-4 h-4 rounded border-white/20 bg-surface-container-highest text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-on-surface">聊天互动</span>
                    </label>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowNewTokenModal(false)}
                    className="flex-1 py-2 bg-surface-container-highest text-on-surface rounded-lg font-medium hover:bg-surface-container transition-all"
                  >
                    取消
                  </button>
                  <LaserButton
                    onClick={handleCreateToken}
                    disabled={isCreatingToken || !newTokenName.trim()}
                    className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50"
                  >
                    {isCreatingToken ? '创建中...' : '创建'}
                  </LaserButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTokenCreatedModal && createdToken && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-background rounded-2xl border border-white/10 max-w-md w-full overflow-hidden"
            >
              <div className="p-4 border-b border-white/5">
                <h3 className="font-semibold text-on-surface">令牌已创建！</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-500/80">
                    请立即复制此令牌！您将不会再看到它。
                  </p>
                </div>
                <div className="bg-surface-container-highest rounded-lg p-3 font-mono text-sm break-all text-on-surface">
                  {createdToken.token}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyToken}
                    className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                      copied ? 'bg-green-500 text-white' : 'bg-primary text-on-primary'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={18} />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        复制令牌
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowTokenCreatedModal(false);
                    setCreatedToken(null);
                  }}
                  className="w-full py-2 text-outline hover:text-on-surface transition-colors text-sm"
                >
                  完成
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
