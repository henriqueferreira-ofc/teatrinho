// routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import fetch from "node-fetch";

const ALLOWED_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
]);

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.get("/api/proxy-image", async (req, res) => {
    try {
      const urlParam = req.query.url;
      if (!urlParam || typeof urlParam !== "string") {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      const u = new URL(urlParam);
      if (u.protocol !== "https:") {
        return res.status(400).json({ error: "Only HTTPS is allowed" });
      }

      // valida host permitido (CORRIGIDO: sem chave extra)
      if (!Array.from(ALLOWED_HOSTS).some(h => u.hostname === h || u.hostname.endsWith(`.${h}`))) {
        return res.status(400).json({ error: "Only Firebase Storage URLs are allowed" });
      }

      const response = await fetch(u.toString());
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch image" });
      }

      const contentType = response.headers.get("content-type") ?? "application/octet-stream";
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=3600");

      const arrayBuf = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuf));
    } catch (err) {
      console.error("Proxy image error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
