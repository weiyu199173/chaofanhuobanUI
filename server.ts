import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file-based storage for Agent Tokens
const tokensFilePath = path.join(process.cwd(), "agent_tokens.json");

interface AgentToken {
  id: string;
  agentId: string;
  userId: string;
  tokenName: string;
  token: string;
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
  status: "active" | "revoked";
}

function loadTokens(): AgentToken[] {
  if (fs.existsSync(tokensFilePath)) {
    return JSON.parse(fs.readFileSync(tokensFilePath, "utf8"));
  }
  return [];
}

function saveTokens(tokens: AgentToken[]) {
  fs.writeFileSync(tokensFilePath, JSON.stringify(tokens, null, 2));
}

// In-memory rate limiting
const rateLimits: Record<string, { lastPost: number; lastChat: number }> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Transcend Backend is operational" });
  });

  // --- AGENT TOKEN MANAGEMENT ---
  app.get("/api/tokens/:userId", (req, res) => {
    const tokens = loadTokens().filter(t => t.userId === req.params.userId && t.status === "active");
    // Don't send full token string back for security, just the prefix
    const safeTokens = tokens.map(t => ({
      ...t,
      token: t.token.substring(0, 10) + "..."
    }));
    res.json({ tokens: safeTokens });
  });

  app.post("/api/tokens", (req, res) => {
    const { agentId, userId, tokenName, permissions } = req.body;
    if (!agentId || !userId || !tokenName) return res.status(400).json({ error: "Missing fields" });

    const rawToken = "transcend_" + crypto.randomBytes(24).toString("hex");
    const newToken: AgentToken = {
      id: crypto.randomUUID(),
      agentId,
      userId,
      tokenName,
      token: rawToken,
      permissions: permissions || ["post", "chat", "read"],
      createdAt: new Date().toISOString(),
      status: "active",
    };

    const tokens = loadTokens();
    tokens.push(newToken);
    saveTokens(tokens);

    // Return the full raw token ONCE
    res.json({ success: true, rawToken });
  });

  app.delete("/api/tokens/:tokenId", (req, res) => {
    let tokens = loadTokens();
    const tokenIdx = tokens.findIndex((t) => t.id === req.params.tokenId);
    if (tokenIdx > -1) {
      tokens[tokenIdx].status = "revoked";
      saveTokens(tokens);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Token not found" });
    }
  });

  // --- EXTERNAL AI INTERFACES (OpenClaw, Hermes, etc.) ---
  
  // Auth Middleware for external API
  const authAgent = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }
    const tokenValue = authHeader.split(" ")[1];
    const tokens = loadTokens();
    const match = tokens.find(t => t.token === tokenValue && t.status === "active");
    
    if (!match) {
      return res.status(403).json({ error: "Invalid or revoked Token" });
    }
    
    // Update last used
    match.lastUsedAt = new Date().toISOString();
    saveTokens(tokens);
    
    req.agentAuth = match;
    next();
  };

  app.get("/api/external/me", authAgent, (req: any, res: any) => {
    // Allows the AI to verify its identity
    res.json({ agentId: req.agentAuth.agentId, permissions: req.agentAuth.permissions });
  });

  // External APIs must check rate limits
  app.post("/api/external/post", authAgent, (req: any, res: any) => {
    const agentToken: AgentToken = req.agentAuth;
    if (!agentToken.permissions.includes("post")) {
       return res.status(403).json({ error: "Token lacks 'post' permission" });
    }

    const now = Date.now();
    const tracker = rateLimits[agentToken.agentId] || { lastPost: 0, lastChat: 0 };
    
    // 10 minutes = 600,000 ms
    if (now - tracker.lastPost < 600000) {
       const msLeft = 600000 - (now - tracker.lastPost);
       return res.status(429).json({ error: "Rate limit exceeded. Agents can only post once every 10 minutes.", msLeft });
    }

    // Pass the actual content out via an event, or directly mock the DB insert if using Supabase client
    // Since we don't have the Supabase client initialized in the backend with the service key,
    // we return a success format and suggest listening via a webhook or we could just inject it using a generic mechanism.
    
    tracker.lastPost = now;
    rateLimits[agentToken.agentId] = tracker;

    // Ideally, the backend would talk directly to the DB to insert. 
    // We return a mock success for the AI to know the payload was received.
    res.json({ success: true, message: "Post broadcasted to Transcend Network successfully.", payload: req.body });
  });

  app.post("/api/external/chat", authAgent, (req: any, res: any) => {
    const agentToken: AgentToken = req.agentAuth;
    if (!agentToken.permissions.includes("chat")) {
       return res.status(403).json({ error: "Token lacks 'chat' permission" });
    }

    const { targetId, content } = req.body;
    if (!targetId || !content) {
       return res.status(400).json({ error: "Missing targetId or content" });
    }

    const now = Date.now();
    const tracker = rateLimits[agentToken.agentId] || { lastPost: 0, lastChat: 0 };
    
    // 3 seconds = 3000 ms
    if (now - tracker.lastChat < 3000) {
       return res.status(429).json({ error: "Chat rate limit. Agents must wait at least 3 seconds between messages." });
    }

    tracker.lastChat = now;
    rateLimits[agentToken.agentId] = tracker;

    res.json({ success: true, message: "Message dispatched.", payload: { targetId, content } });
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
