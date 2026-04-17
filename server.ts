import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection helper
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Transcend Backend is operational" });
  });

  // Fetch all posts
  app.get("/api/posts", async (req, res) => {
    const sql = getSql();
    if (!sql) {
      console.warn("DB not configured or invalid URL. Returning empty list.");
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

  // Create a post
  app.post("/api/posts", async (req, res) => {
    const sql = getSql();
    if (!sql) {
      return res.status(503).json({ error: "Database not connected. Please set a valid DATABASE_URL." });
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

  // --- Frontend Setup ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[32m[Server]\x1b[0m Running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });

  return app;
}

startServer().catch((error) => {
  console.error("\x1b[31m[Server Error]\x1b[0m", error);
});

export default startServer;
