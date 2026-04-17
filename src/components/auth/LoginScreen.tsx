import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, EyeOff, Sparkles, MessageCircle, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onGoToRegister: () => void;
  onAction?: (msg: string, type?: 'success' | 'info') => void;
}

export const LoginScreen = ({ onLogin, onGoToRegister, onAction }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onAction?.('请输入邮箱和密码', 'info');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      onAction?.('登录成功', 'success');
      onLogin(data.user);
    } catch (error: any) {
      onAction?.(error.message || '登录失败', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen items-center justify-center p-6 bg-black overflow-hidden relative"
    >
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />

      <main className="w-full max-w-[420px] z-10 flex flex-col space-y-12">
        <header className="flex flex-col items-center text-center space-y-4">
          <div className="flex flex-col items-center group">
            <div className="grid grid-cols-4 gap-[2px] w-6 h-6 mb-6 opacity-90 group-hover:opacity-100 transition-opacity">
              {[1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1].map((p, i) => (
                <div key={i} className={`aspect-square ${p ? 'bg-primary' : 'bg-transparent'}`} />
              ))}
            </div>
            <h1 className="text-3xl font-headline font-bold tracking-[0.2em] text-on-surface">超凡伙伴</h1>
            <p className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary mt-1">TranscendPartner</p>
          </div>
        </header>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">电子邮箱</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">密码</label>
                <button type="button" className="text-[10px] uppercase tracking-widest text-primary hover:text-primary transition-colors font-bold">忘记密码</button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-outline hover:text-primary"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-on-surface text-background font-headline font-bold text-sm tracking-widest py-5 rounded-full hover:scale-[0.98] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
          >
            {loading ? '同步中...' : '登录'}
          </button>

          <div className="text-center">
            <span className="text-xs text-on-surface-variant">还没有账号？</span>
            <button type="button" onClick={onGoToRegister} className="text-xs text-primary font-bold hover:underline underline-offset-4 ml-1">注册</button>
          </div>
        </form>

        <footer className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-surface-container-high" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-outline font-bold">其他登录方式</span>
            <div className="h-[1px] flex-1 bg-surface-container-high" />
          </div>
          <div className="flex justify-center gap-8">
            <button type="button" className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors group">
              <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
            </button>
            <button type="button" className="w-14 h-14 rounded-full bg-surface-container-lowest flex items-center justify-center hover:bg-surface-container-high transition-colors group">
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </footer>
      </main>
    </motion.div>
  );
};
