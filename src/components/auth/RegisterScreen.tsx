import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, EyeOff } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: () => void;
  onBack: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onBack }) => {
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

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

        <section className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">手机号</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+86 1XX XXXX XXXX"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <button className="absolute right-4 top-4 text-xs font-bold text-primary hover:opacity-80">获取验证码</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">验证码</label>
              <input
                type="text"
                placeholder="请输入6位验证码"
                className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold ml-1">设置密码</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border-none border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-on-surface placeholder:text-outline/40 py-4 px-4 transition-all duration-300 rounded-lg"
                />
                <EyeOff size={18} className="absolute right-4 top-4 text-outline" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onRegister()}
            className="w-full bg-primary text-on-primary font-headline font-bold text-sm tracking-widest py-5 rounded-full hover:scale-[0.98] active:scale-95 transition-all shadow-[0_0_20px_rgba(29,155,240,0.2)]"
          >
            注册并加入
          </button>
        </section>
      </main>
    </motion.div>
  );
};

export default RegisterScreen;
