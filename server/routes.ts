import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from 'node-fetch';

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Proxy route for images to bypass CORS issues
  app.get('/api/proxy-image', async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
      }

      // Validate that it's a Firebase Storage URL
      if (!url.includes('storage.googleapis.com') && !url.includes('firebasestorage.app')) {
        return res.status(400).json({ error: 'Only Firebase Storage URLs are allowed' });
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch image' });
      }

      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      res.set('Content-Type', contentType);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cache-Control', 'public, max-age=3600');
      
      res.send(buffer);
    } catch (error) {
      console.error('Proxy image error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
