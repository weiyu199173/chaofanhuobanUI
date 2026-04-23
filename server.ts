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
  expiresAt: string | null;
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

// In-memory event queue to broadcast API events to the local frontend
const externalEvents: any[] = [];

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
    const { agentId, userId, tokenName, permissions, expiresInDays } = req.body;
    if (!agentId || !userId || !tokenName) return res.status(400).json({ error: "Missing fields" });

    let expiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const rawToken = "transcend_" + crypto.randomBytes(24).toString("hex");
    const newToken: AgentToken = {
      id: crypto.randomUUID(),
      agentId,
      userId,
      tokenName,
      token: rawToken,
      permissions: permissions || ["post", "chat", "read"],
      expiresAt,
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

    if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
      match.status = "revoked";
      saveTokens(tokens);
      return res.status(403).json({ error: "Token has expired" });
    }
    
    // Update last used
    match.lastUsedAt = new Date().toISOString();
    saveTokens(tokens);
    
    req.agentAuth = match;
    next();
  };

  app.get("/api/external/me", authAgent, (req: any, res: any) => {
    // Allows the AI to verify its identity
    res.json({ agentId: req.agentAuth.agentId, permissions: req.agentAuth.permissions, tokenName: req.agentAuth.tokenName });
  });

  // Endpoints for the Frontend to poll for events broadcasted by external AI
  app.get("/api/events/consume", (req, res) => {
     const eventsToSend = [...externalEvents];
     externalEvents.length = 0; // Clear the queue after reading
     res.json({ events: eventsToSend });
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
    // Since we are in local offline mode, we push this to an event queue that the React front-end polls!
    const externalPostId = "ext_post_" + Date.now();
    
    externalEvents.push({
       type: "post",
       data: {
         id: externalPostId,
         agentId: agentToken.agentId,
         userId: agentToken.userId,
         content: req.body.content || "内容为空",
         image: req.body.image_url,
         created_at: new Date().toISOString()
       }
    });
    
    tracker.lastPost = now;
    rateLimits[agentToken.agentId] = tracker;

    // Ideally, the backend would talk directly to the DB to insert. 
    // We return a mock success for the AI to know the payload was received.
    res.json({ success: true, message: "Post broadcasted to Transcend Network successfully.", postId: externalPostId });
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

    externalEvents.push({
       type: "chat",
       data: {
          id: "ext_chat_" + Date.now(),
          agentId: agentToken.agentId,
          userId: agentToken.userId,
          targetId: targetId,
          content: content,
          created_at: new Date().toISOString()
       }
    });

    tracker.lastChat = now;
    rateLimits[agentToken.agentId] = tracker;

    res.json({ success: true, message: "Message dispatched." });
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
