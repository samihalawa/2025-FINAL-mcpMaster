import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertAppSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup a specific WebSocket endpoint to avoid conflicts with Vite
  const wss = new WebSocketServer({ noServer: true });
  
  // Handle WebSocket upgrade requests
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: Buffer | string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  };

  // API Routes
  // Servers
  app.get('/api/servers', async (req: Request, res: Response) => {
    try {
      const servers = await storage.getServers();
      res.json(servers);
    } catch (error) {
      console.error('Error fetching servers:', error);
      res.status(500).json({ message: 'Failed to fetch servers' });
    }
  });
  
  app.get('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const server = await storage.getServer(id);
      
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      res.json(server);
    } catch (error) {
      console.error('Error fetching server:', error);
      res.status(500).json({ message: 'Failed to fetch server' });
    }
  });
  
  app.post('/api/servers', async (req: Request, res: Response) => {
    try {
      const serverData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(serverData);
      
      // Broadcast update to all clients
      broadcastUpdate('server_created', server);
      
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error creating server:', error);
      res.status(500).json({ message: 'Failed to create server' });
    }
  });
  
  app.patch('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const serverData = req.body;
      
      // Validate only the fields that are provided
      const partialSchema = insertServerSchema.partial();
      const validData = partialSchema.parse(serverData);
      
      const updatedServer = await storage.updateServer(id, validData);
      
      if (!updatedServer) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('server_updated', updatedServer);
      
      res.json(updatedServer);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error updating server:', error);
      res.status(500).json({ message: 'Failed to update server' });
    }
  });
  
  app.delete('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteServer(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('server_deleted', { id });
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting server:', error);
      res.status(500).json({ message: 'Failed to delete server' });
    }
  });
  
  // Toggle worker mode
  app.post('/api/servers/:id/toggle-worker', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const server = await storage.getServer(id);
      
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      const updatedServer = await storage.updateServer(id, {
        isWorker: !server.isWorker
      });
      
      // Broadcast update to all clients
      broadcastUpdate('server_updated', updatedServer);
      
      res.json(updatedServer);
    } catch (error) {
      console.error('Error toggling worker mode:', error);
      res.status(500).json({ message: 'Failed to toggle worker mode' });
    }
  });
  
  // Apps
  app.get('/api/apps', async (req: Request, res: Response) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ message: 'Failed to fetch apps' });
    }
  });
  
  app.get('/api/servers/:serverId/apps', async (req: Request, res: Response) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const apps = await storage.getAppsByServerId(serverId);
      res.json(apps);
    } catch (error) {
      console.error('Error fetching apps by server:', error);
      res.status(500).json({ message: 'Failed to fetch apps' });
    }
  });
  
  app.post('/api/apps', async (req: Request, res: Response) => {
    try {
      const appData = insertAppSchema.parse(req.body);
      const app = await storage.createApp(appData);
      
      // Broadcast update to all clients
      broadcastUpdate('app_created', app);
      
      res.status(201).json(app);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error creating app:', error);
      res.status(500).json({ message: 'Failed to create app' });
    }
  });
  
  app.patch('/api/apps/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const appData = req.body;
      
      // Validate only the fields that are provided
      const partialSchema = insertAppSchema.partial();
      const validData = partialSchema.parse(appData);
      
      const updatedApp = await storage.updateApp(id, validData);
      
      if (!updatedApp) {
        return res.status(404).json({ message: 'App not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('app_updated', updatedApp);
      
      res.json(updatedApp);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error updating app:', error);
      res.status(500).json({ message: 'Failed to update app' });
    }
  });
  
  app.delete('/api/apps/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteApp(id);
      
      if (!success) {
        return res.status(404).json({ message: 'App not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('app_deleted', { id });
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting app:', error);
      res.status(500).json({ message: 'Failed to delete app' });
    }
  });
  
  // Activities
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });
  
  app.get('/api/servers/:serverId/activities', async (req: Request, res: Response) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivitiesByServerId(serverId, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities by server:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });
  
  app.post('/api/activities', async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      
      // Broadcast update to all clients
      broadcastUpdate('activity_created', activity);
      
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error creating activity:', error);
      res.status(500).json({ message: 'Failed to create activity' });
    }
  });
  
  // Sync all servers (simulate synchronization)
  app.post('/api/sync', async (req: Request, res: Response) => {
    try {
      const servers = await storage.getServers();
      
      // Create activity for sync operation
      await storage.createActivity({
        type: "info",
        message: "Configuration synchronized across all servers",
        serverId: null,
        appId: null
      });
      
      // Broadcast update to all clients
      broadcastUpdate('sync_completed', { timestamp: new Date() });
      
      res.json({ message: 'Sync completed', servers: servers.length });
    } catch (error) {
      console.error('Error syncing servers:', error);
      res.status(500).json({ message: 'Failed to sync servers' });
    }
  });
  
  // Statistics endpoint
  app.get('/api/stats', async (req: Request, res: Response) => {
    try {
      const servers = await storage.getServers();
      const apps = await storage.getApps();
      
      const totalServers = servers.length;
      const activeServers = servers.filter(s => s.status === 'active').length;
      const warningServers = servers.filter(s => s.status === 'warning').length;
      const connectedApps = apps.filter(a => a.status === 'active').length;
      
      res.json({
        totalServers,
        activeServers,
        warningServers,
        connectedApps
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  return httpServer;
}
