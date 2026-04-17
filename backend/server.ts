import express from 'express';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import routes from './api/routes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 导出supabase实例供路由使用
export { supabase };

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 认证路由
app.post('/api/auth/register', async (req, res) => {
  const { phone, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      phone,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API路由
app.use('/api', routes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
