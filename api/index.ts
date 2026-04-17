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
