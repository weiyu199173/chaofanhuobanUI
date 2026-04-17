const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 中间件
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 获取用户信息
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 创建AI伙伴
app.post('/api/agents', async (req, res) => {
  const { name, type, traits, userId } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .insert({
      name,
      type,
      traits,
      user_id: userId,
      sync_rate: 0,
      status: 'training'
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 获取用户的AI伙伴
app.get('/api/agents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});