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
});const express = require('expressconst express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 300const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化Supabase客户端const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnconst express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createconst express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// 初始化Supabase客户端
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 中间件
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
app.get('/api/healthconst express = require('express');
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

// 用户相关API
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

// 用户相关API
app.get('/api/user/:id', async (req, res) => {
  const {const express = require('express');
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

// 用户相关API
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
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

// 用户相关API
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('users')
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

// 用户相关API
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .singleconst express = require('express');
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

// 用户相关API
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).const express = require('express');
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

// 用户相关API
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(4const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(dataconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
app.post('/api/agents', async (req, res) => {
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
app.post('/api/agents', async (req, res) => {
  const { name, type, traits, userId } = req.body;
  
  constconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
app.post('/api/agents', async (req, res) => {
  const { name, type, traits, userId } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
app.post('/api/agents', async (req, res) => {
  const { name, type, traits, userId } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .insert({
      name,
      typeconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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
    }const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

  if (error)const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/agents/:userId', async (req, res)const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/agents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { dataconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/agents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('agents')
    .select('const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/agents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);

  if (errorconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.get('/api/agents/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/apiconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } =const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = reqconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at:const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', idconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error)const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关APIconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const {const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id:const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error:const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const {const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return resconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error:const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  constconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = awaitconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error)const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关APIconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const {const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError }const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res)const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const {const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .selectconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('postconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ errorconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderIdconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  constconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  const { data, error } = await supabase
    .from('messages')
    .const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
      sender_type:const express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
      sender_type: senderType,
      agent_id: agentId,
      receiver_id: receiverId
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
      sender_type: senderType,
      agent_id: agentId,
      receiver_id: receiverId
    })
    .select()
    .single();

  if (errorconst express = require('express');
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

// 用户相关API
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

app.post('/api/users', async (req, res) => {
  const { id, email, displayName, avatarUrl } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// AI伙伴相关API
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

app.put('/api/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, traits, syncRate, status } = req.body;
  
  const { data, error } = await supabase
    .from('agents')
    .update({
      name,
      type,
      traits,
      sync_rate: syncRate,
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 帖子相关API
app.post('/api/posts', async (req, res) => {
  const { content, imageUrl, authorId, authorType, agentId } = req.body;
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts', async (req, res) => {
  const { authorType } = req.query;
  
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
  
  if (authorType) {
    query = query.eq('author_type', authorType);
  }
  
  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 评论相关API
app.post('/api/comments', async (req, res) => {
  const { content, postId, authorId, authorType, agentId } = req.body;
  
  // 开始事务
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
      agent_id: agentId
    })
    .select()
    .single();

  if (commentError) {
    return res.status(400).json({ error: commentError.message });
  }

  // 更新帖子评论数
  await supabase
    .from('posts')
    .update({ comments: supabase.raw('comments + 1') })
    .eq('id', postId);

  res.json(comment);
});

app.get('/api/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// 消息相关API
app.post('/api/messages', async (req, res) => {
  const { content, senderId, senderType, agentId, receiverId } = req.body;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: senderId,
      sender_type: senderType,
      agent_id: agentId,
      receiver_id: receiverId
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);