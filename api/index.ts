import express from "express";
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

const DEFAULT_URL = 'postgresql://postgres:YOUR_PASSWORD_HERE@db.kuijamybarbiwywjbnxf.supabase.co:5432/postgres';
const DATABASE_URL = process.env.DATABASE_URL || DEFAULT_URL;

// Validation: Only try to connect if it looks like a real URL
const isDbConfigured = DATABASE_URL.startsWith('postgres') && 
                       !DATABASE_URL.includes('YOUR_PASSWORD_HERE') && 
                       !DATABASE_URL.includes('[YOUR-PASSWORD]');

let sqlClient: any = null;

function getSql() {
  if (!isDbConfigured) return null;
  if (!sqlClient) {
    try {
      sqlClient = postgres(DATABASE_URL, {
        onnotice: () => {}, 
        connect_timeout: 10,
      });
    } catch (e) {
      console.error("Failed to initialize Postgres client:", e);
      return null;
    }
  }
  return sqlClient;
}

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Transcend Backend is operational (Vercel Mode)" });
});

app.get("/api/posts", async (req, res) => {
  const sql = getSql();
  if (!sql) {
    return res.json([]);
  }
  try {
    const posts = await sql`
      SELECT * FROM posts 
      ORDER BY created_at DESC
    `;
    res.json(posts);
  } catch (error: any) {
    console.error("DB Error (Fetch):", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts", async (req, res) => {
  const sql = getSql();
  if (!sql) {
    return res.status(503).json({ error: "Database not connected." });
  }
  const { author_data, content, image_url, user_id } = req.body;
  try {
    const result = await sql`
      INSERT INTO posts (author_data, content, image_url, user_id, created_at)
      VALUES (
        ${sql.json(author_data)}, 
        ${content}, 
        ${image_url || null}, 
        ${user_id}, 
        NOW()
      )
      RETURNING *
    `;
    res.json(result[0]);
  } catch (error: any) {
    console.error("DB Error (Insert):", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts/:id/like", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { id } = req.params;
  const { action } = req.body; // 'like' or 'unlike'
  
  try {
    const result = await sql`
      UPDATE posts 
      SET likes_count = likes_count + ${action === 'like' ? 1 : -1}
      WHERE id = ${id}
      RETURNING likes_count
    `;
    res.json(result[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/posts/:id/comments", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { id } = req.params;
  try {
    const comments = await sql`
      SELECT * FROM comments 
      WHERE post_id = ${id}
      ORDER BY created_at ASC
    `;
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/comments", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { post_id, author_data, content, user_id } = req.body;
  try {
    // Start a transaction if needed, but for simplicity we do two queries
    const [newComment] = await sql`
      INSERT INTO comments (post_id, author_data, content, user_id, created_at)
      VALUES (${post_id}, ${sql.json(author_data)}, ${content}, ${user_id}, NOW())
      RETURNING *
    `;
    
    await sql`
      UPDATE posts 
      SET comments_count = comments_count + 1
      WHERE id = ${post_id}
    `;
    
    res.json(newComment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Chat & Custom Agents APIs ---

app.get("/api/messages", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { chat_id } = req.query;
  try {
    const messages = await sql`
      SELECT * FROM messages 
      WHERE chat_id = ${chat_id as string}
      ORDER BY created_at ASC
    `;
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { chat_id, sender_id, content, is_ai } = req.body;
  try {
    const [newMessage] = await sql`
      INSERT INTO messages (chat_id, sender_id, content, is_ai, created_at)
      VALUES (${chat_id}, ${sender_id}, ${content}, ${is_ai}, NOW())
      RETURNING *
    `;
    res.json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/custom-agents", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { user_id } = req.query;
  try {
    const agents = await sql`
      SELECT * FROM custom_agents 
      WHERE user_id = ${user_id as string}
      ORDER BY created_at DESC
    `;
    res.json(agents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/custom-agents", async (req, res) => {
  const sql = getSql();
  if (!sql) return res.status(503).json({ error: "DB not connected" });
  
  const { user_id, name, avatar, bio, traits } = req.body;
  try {
    const [newAgent] = await sql`
      INSERT INTO custom_agents (user_id, name, avatar, bio, traits, created_at)
      VALUES (${user_id}, ${name}, ${avatar}, ${bio}, ${sql.json(traits)}, NOW())
      RETURNING *
    `;
    res.json(newAgent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- SQL MIGRATION (Execute in Supabase SQL Editor if table is missing) ---
/*
CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_id UUID,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS custom_agents (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  traits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
*/

// For SPA handling in Vercel functions if no other route matches
// Note: Vercel usually handles this via vercel.json rewrites, but this helps locally.
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;
