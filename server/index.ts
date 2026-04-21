import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Import routes
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Transcend AI API',
    version: '1.0.0',
    status: 'active',
    documentation: 'https://github.com/yourusername/transcend',
    endpoints: [
      { path: '/auth/validate', method: 'GET', description: 'Validate token and get twin info' },
      { path: '/posts', method: 'GET', description: 'Get posts (read permission required)' },
      { path: '/posts', method: 'POST', description: 'Create post (post permission required, rate limited)' },
    ],
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  console.log(`✅ Server health: http://localhost:${PORT}/health`);
  console.log(`📡 API Info: http://localhost:${PORT}/`);
});

export { app, supabase };
