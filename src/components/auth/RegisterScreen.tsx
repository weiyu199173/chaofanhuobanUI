import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, EyeOff, Eye } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface RegisterScreenProps {
  onRegister: (user: any) => void;
  onBack: () => void;
  onAction?: (msg: string, type?: 'success' | 'info') => void;
}

export const RegisterScreen = ({ onRegister, onBack, onAction }: RegisterScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nickname) {
      onAction?.('请填写完整信息', 'info');
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        // Standalone mode: Instant registration with dummy user
        onAction?.('单机演示模式：本地虚拟账号已创建', 'success');
        onRegister({
          id: 'demo-user-' + Date.now(),
          email: email,
          user_metadata: { nickname: nickname }
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
           data: {
              nickname: nickname
           }
        }
      });

      if (error) {
         if (error.message.includes('User already registered')) {
            onAction?.('该邮箱已被注册，请直接登录！', 'info');
         } else {
            console.error("SignUp Error:", error);
            onAction?.(error.message || '注册失败', 'info');
         }
         return;
      }
      
      onAction?.('注册成功，请查收验证邮件（如果开启了邮件验证）', 'success');
      if (data.user) {
        // Also ensure a profile is created since triggers might be missing
        await supabase.from('profiles').upsert([{ 
          id: data.user.id,
          user_id: data.user.id,
          name: nickname,
          is_agent: false,
          type: 'human'
        }], { onConflict: 'id' }).select();
        onRegister(data.user);
      }
    } catch (error: any) {
      console.error("Catch block signup error:", error);
      onAction?.(error.message || '注册异常', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="flex flex-col min-h-screen items-center justify-center p-6 bg-black overflow-hidden relative"
    >
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full" />

      <main className="w-full max-w-[420px] z-10 flex flex-col space-y-12">
        <header className="flex flex-col items-center text-center space-y-4">
          <button onClick={onBack} className="self-start flex items-center gap-2 text-outline hover:text-primary transition-colors mb-4">
             <ArrowLeft size={20} />
             <span className="text-sm font-bold tracking-widest uppercase">返回登录</span>
          </button>
          <div className="flex flex-col items-center group">
            <h1 className="text-3xl font-headline font-bold tracking-[0.2em] text-on-surface">创建账号</h1>
            <p className="text-[10px] font-headline uppercase tracking-[0.4em] text-primary mt-1">Join TranscendPartner</p>
          </div>
        </header>

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">昵称</label>
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="您的数字代号"
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">电子邮箱</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">设置密码</label>
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
            className="w-full bg-primary text-on-primary font-headline font-bold text-sm tracking-widest py-5 rounded-full hover:scale-[0.98] active:scale-95 transition-all shadow-[0_0_20px_rgba(29,155,240,0.2)] disabled:opacity-50"
          >
            {loading ? '同步中...' : (isSupabaseConfigured ? '注册并加入' : '建立离线会话')}
          </button>
        </form>
      </main>
    </motion.div>
  );
};
