import React, { useState } from 'react';
import { ChevronLeft, Shield, Upload, User, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { LaserButton, TiltedCard } from '../Common';
import { DigitalTwinService } from '../../services/digitalTwinService';

export const DigitalTwinCreateScreen = ({
  onBack,
  onSuccess,
  userId
}: {
  onBack: () => void;
  onSuccess: () => void;
  userId: string;
}) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [personalitySignature, setPersonalitySignature] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  const handleRegenerateAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('请输入数字孪生的名字');
      return;
    }
    if (!bio.trim()) {
      setError('请输入数字孪生的简介');
      return;
    }
    if (!personalitySignature.trim()) {
      setError('请输入数字孪生的个性签名');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await DigitalTwinService.createDigitalTwin(
        userId,
        name.trim(),
        avatarUrl,
        bio.trim(),
        personalitySignature.trim()
      );

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError('创建失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background pb-32 overflow-hidden relative">
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <LaserButton onClick={onBack} className="p-2 rounded-full text-primary">
            <ChevronLeft size={24} />
          </LaserButton>
          <h1 className="text-xl font-bold text-on-surface tracking-widest uppercase font-headline">创建数字孪生</h1>
        </div>
      </header>

      <main className="flex-1 pt-24 px-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
          <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-start gap-4">
            <Shield size={20} className="text-error shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-error">安全警告</p>
              <p className="text-xs text-outline leading-relaxed">
                创建数字孪生意味着授予 AI 模拟您的风格。请确保您的隐私设置正确，并只与信任的人分享。
              </p>
            </div>
          </div>

          <section className="flex flex-col items-center">
            <TiltedCard className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary to-primary-container rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000" />
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-surface-container-high bg-surface-container">
                <img src={avatarUrl} className="w-full h-full object-cover" alt="数字孪生头像" />
              </div>
            </TiltedCard>
            <div className="mt-4 flex gap-3">
              <LaserButton
                onClick={handleRegenerateAvatar}
                className="flex items-center gap-2 px-5 py-2 bg-surface-container-highest text-on-surface rounded-full border border-white/5 hover:bg-surface-container transition-all"
              >
                <RefreshCw size={16} />
                <span className="text-sm font-medium">换一个头像</span>
              </LaserButton>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">名字</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="给数字孪生起个名字"
                  className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-12 py-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">简介</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="描述一下这个数字孪生的特点..."
                rows={4}
                className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline">个性签名</label>
              <textarea
                value={personalitySignature}
                onChange={(e) => setPersonalitySignature(e.target.value)}
                placeholder="用一段话定义数字孪生的个性和风格..."
                rows={5}
                className="w-full bg-surface-container-highest border border-white/5 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary/50 transition-all resize-none"
              />
            </div>
          </section>

          {error && (
            <div className="bg-error/5 border border-error/20 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-error shrink-0" />
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-primary shrink-0" />
              <p className="text-sm text-primary">创建成功！正在跳转...</p>
            </div>
          )}

          <div className="pt-4">
            <LaserButton
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>创建中...</span>
                </>
              ) : (
                <span>创建数字孪生</span>
              )}
            </LaserButton>
          </div>
        </div>
      </main>
    </div>
  );
};
