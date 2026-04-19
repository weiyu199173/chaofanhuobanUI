// Vite 环境变量测试脚本
import { defineConfig, loadEnv } from 'vite';

// 模拟 Vite 加载环境变量
const env = loadEnv('development', '.', 'VITE_');
console.log('Vite loaded env:');
console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY);
console.log('All env keys:', Object.keys(env));
