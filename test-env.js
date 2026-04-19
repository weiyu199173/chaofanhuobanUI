// 测试环境变量读取
console.log('Testing environment variables...');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY);
console.log('All env keys:', Object.keys(process.env));
