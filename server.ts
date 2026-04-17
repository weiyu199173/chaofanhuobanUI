import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Transcend Backend is operational" });
  });

  // Example of a backend-only logic (e.g. proxying or secret handling)
  app.get("/api/config", (req, res) => {
    // Hidden config or feature flags
    res.json({
      featureFlags: {
        agentSync: true,
        mcpMarket: true,
      }
    });
  });

  // Vite middleware for development
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
    console.log(`\x1b[32m[Server]\x1b[0m Running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("\x1b[31m[Server Error]\x1b[0m", error);
});
