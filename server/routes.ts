import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertAppSchema, insertActivitySchema, insertToolSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";

// Import WebSocket from ws (needed to access OPEN status)
import { WebSocket as WSType } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup a specific WebSocket endpoint to avoid conflicts with Vite
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: { timestamp: new Date().toISOString() }
    }));
    
    ws.on('message', (message: Buffer | string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle commands sent through WebSocket
        handleWebSocketCommand(data, ws);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WSType.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  };
  
  // Handle WebSocket commands (headless API operations)
  const handleWebSocketCommand = async (data: any, ws: WebSocket) => {
    try {
      if (!data.command) {
        throw new Error('No command specified');
      }
      
      switch (data.command) {
        case 'sync_servers':
          const servers = await storage.getServers();
          
          // Create activity for sync operation
          const activity = await storage.createActivity({
            type: "info",
            message: "Configuration synchronized through WebSocket",
            serverId: null,
            appId: null
          });
          
          ws.send(JSON.stringify({
            type: 'sync_completed',
            data: { 
              timestamp: new Date().toISOString(),
              servers: servers.length
            }
          }));
          
          // Also broadcast to all clients
          broadcastUpdate('sync_completed', { 
            timestamp: new Date().toISOString(),
            servers: servers.length
          });
          break;
          
        case 'toggle_worker':
          if (!data.serverId) {
            throw new Error('Server ID is required');
          }
          
          const server = await storage.getServer(Number(data.serverId));
          if (!server) {
            throw new Error('Server not found');
          }
          
          const updatedServer = await storage.updateServer(Number(data.serverId), {
            isWorker: !server.isWorker
          });
          
          ws.send(JSON.stringify({
            type: 'server_updated',
            data: updatedServer
          }));
          
          // Also broadcast to all clients
          broadcastUpdate('server_updated', updatedServer);
          break;
          
        case 'get_tools':
          const tools = await storage.getTools();
          
          ws.send(JSON.stringify({
            type: 'tools_list',
            data: tools
          }));
          break;
          
        case 'get_server_tools':
          if (!data.serverId) {
            throw new Error('Server ID is required');
          }
          
          const serverTools = await storage.getToolsByServerId(Number(data.serverId));
          
          ws.send(JSON.stringify({
            type: 'server_tools',
            data: {
              serverId: Number(data.serverId),
              tools: serverTools
            }
          }));
          break;
          
        case 'toggle_tool':
          if (!data.toolId) {
            throw new Error('Tool ID is required');
          }
          
          const tool = await storage.getTool(Number(data.toolId));
          if (!tool) {
            throw new Error('Tool not found');
          }
          
          const updatedTool = await storage.updateTool(Number(data.toolId), {
            active: !tool.active
          });
          
          ws.send(JSON.stringify({
            type: 'tool_updated',
            data: updatedTool
          }));
          
          // Also broadcast to all clients
          broadcastUpdate('tool_updated', updatedTool);
          break;
          
        default:
          throw new Error(`Unknown command: ${data.command}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket command:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { 
          message: error instanceof Error ? error.message : 'Unknown error',
          command: data.command
        }
      }));
    }
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
  
  // Tools
  app.get('/api/tools', async (req: Request, res: Response) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      console.error('Error fetching tools:', error);
      res.status(500).json({ message: 'Failed to fetch tools' });
    }
  });
  
  app.get('/api/servers/:serverId/tools', async (req: Request, res: Response) => {
    try {
      const serverId = parseInt(req.params.serverId);
      const tools = await storage.getToolsByServerId(serverId);
      res.json(tools);
    } catch (error) {
      console.error('Error fetching tools by server:', error);
      res.status(500).json({ message: 'Failed to fetch tools' });
    }
  });
  
  app.get('/api/tools/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getTool(id);
      
      if (!tool) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      
      res.json(tool);
    } catch (error) {
      console.error('Error fetching tool:', error);
      res.status(500).json({ message: 'Failed to fetch tool' });
    }
  });
  
  app.post('/api/tools', async (req: Request, res: Response) => {
    try {
      const toolData = insertToolSchema.parse(req.body);
      
      // Validate the server exists before creating the tool
      const server = await storage.getServer(toolData.serverId);
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      const tool = await storage.createTool(toolData);
      
      // Broadcast update to all clients
      broadcastUpdate('tool_created', tool);
      
      res.status(201).json(tool);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error creating tool:', error);
      res.status(400).json({ message: 'Failed to create tool' });
    }
  });
  
  app.patch('/api/tools/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const toolData = req.body;
      
      // Validate only the fields that are provided
      const partialSchema = insertToolSchema.partial();
      const validData = partialSchema.parse(toolData);
      
      const updatedTool = await storage.updateTool(id, validData);
      
      if (!updatedTool) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('tool_updated', updatedTool);
      
      res.json(updatedTool);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error updating tool:', error);
      res.status(500).json({ message: 'Failed to update tool' });
    }
  });
  
  app.delete('/api/tools/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTool(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Tool not found' });
      }
      
      // Broadcast update to all clients
      broadcastUpdate('tool_deleted', { id });
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting tool:', error);
      res.status(500).json({ message: 'Failed to delete tool' });
    }
  });
  
  // Get activities related to a specific tool
  app.get('/api/tools/:toolId/activities', async (req: Request, res: Response) => {
    try {
      const toolId = parseInt(req.params.toolId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getActivitiesByToolId(toolId, limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities by tool:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
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
      const tools = await storage.getTools();
      
      const totalServers = servers.length;
      const activeServers = servers.filter(s => s.status === 'active').length;
      const warningServers = servers.filter(s => s.status === 'warning').length;
      const connectedApps = apps.filter(a => a.status === 'active').length;
      const activeTools = tools.filter(t => t.active).length;
      
      res.json({
        totalServers,
        activeServers,
        warningServers,
        connectedApps,
        activeTools
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // URL Parameter-based API for headless operations
  // This allows direct operations via URL parameters (for testing with curl)
  app.get('/api/headless/operation', async (req: Request, res: Response) => {
    try {
      const { action, id, params } = req.query;
      
      if (!action) {
        return res.status(400).json({ 
          success: false, 
          message: 'Action parameter is required'
        });
      }
      
      // Parse parameters if provided as JSON string
      let parameters = {};
      if (params && typeof params === 'string') {
        try {
          parameters = JSON.parse(params);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: 'Invalid JSON in params parameter'
          });
        }
      }
      
      // Handle different operations based on action parameter
      switch (action) {
        case 'get_stats':
          try {
            const servers = await storage.getServers();
            const apps = await storage.getApps();
            const tools = await storage.getTools();
            
            const totalServers = servers.length;
            const activeServers = servers.filter(s => s.status === 'active').length;
            const warningServers = servers.filter(s => s.status === 'warning').length;
            const connectedApps = apps.filter(a => a.status === 'active').length;
            const activeTools = tools.filter(t => t.active).length;
            
            return res.json({
              success: true,
              data: {
                totalServers,
                activeServers,
                warningServers,
                connectedApps,
                activeTools
              }
            });
          } catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({ 
              success: false, 
              message: 'Failed to fetch statistics' 
            });
          }
          
        case 'get_server':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for get_server action'
            });
          }
          
          const server = await storage.getServer(Number(id));
          if (!server) {
            return res.status(404).json({ 
              success: false, 
              message: 'Server not found'
            });
          }
          
          return res.json({
            success: true,
            data: server
          });
          
        case 'get_app':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for get_app action'
            });
          }
          
          const app = await storage.getApp(Number(id));
          if (!app) {
            return res.status(404).json({ 
              success: false, 
              message: 'App not found'
            });
          }
          
          return res.json({
            success: true,
            data: app
          });
          
        case 'sync_all':
          const servers = await storage.getServers();
          
          // Create activity for sync operation
          await storage.createActivity({
            type: "info",
            message: "Configuration synchronized via headless API",
            serverId: null,
            appId: null
          });
          
          // Broadcast update to all clients
          broadcastUpdate('sync_completed', { timestamp: new Date() });
          
          return res.json({
            success: true,
            message: 'Sync completed',
            servers: servers.length
          });
          
        case 'toggle_worker':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for toggle_worker action'
            });
          }
          
          const targetServer = await storage.getServer(Number(id));
          if (!targetServer) {
            return res.status(404).json({ 
              success: false, 
              message: 'Server not found'
            });
          }
          
          const updatedServer = await storage.updateServer(Number(id), {
            isWorker: !targetServer.isWorker
          });
          
          // Broadcast update to all clients
          broadcastUpdate('server_updated', updatedServer);
          
          return res.json({
            success: true,
            message: `Worker mode ${updatedServer?.isWorker ? 'enabled' : 'disabled'}`,
            data: updatedServer
          });
          
        case 'get_tool':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for get_tool action'
            });
          }
          
          const tool = await storage.getTool(Number(id));
          if (!tool) {
            return res.status(404).json({ 
              success: false, 
              message: 'Tool not found'
            });
          }
          
          return res.json({
            success: true,
            data: tool
          });
          
        case 'get_server_tools':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for get_server_tools action'
            });
          }
          
          const serverTools = await storage.getToolsByServerId(Number(id));
          return res.json({
            success: true,
            data: serverTools
          });
          
        case 'activate_tool':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for activate_tool action'
            });
          }
          
          const targetTool = await storage.getTool(Number(id));
          if (!targetTool) {
            return res.status(404).json({ 
              success: false, 
              message: 'Tool not found'
            });
          }
          
          const updatedTool = await storage.updateTool(Number(id), {
            active: true
          });
          
          // Broadcast update to all clients
          broadcastUpdate('tool_updated', updatedTool);
          
          return res.json({
            success: true,
            message: 'Tool activated',
            data: updatedTool
          });
          
        case 'deactivate_tool':
          if (!id) {
            return res.status(400).json({ 
              success: false, 
              message: 'ID parameter is required for deactivate_tool action'
            });
          }
          
          const targetToolToDeactivate = await storage.getTool(Number(id));
          if (!targetToolToDeactivate) {
            return res.status(404).json({ 
              success: false, 
              message: 'Tool not found'
            });
          }
          
          const updatedToolDeactivated = await storage.updateTool(Number(id), {
            active: false
          });
          
          // Broadcast update to all clients
          broadcastUpdate('tool_updated', updatedToolDeactivated);
          
          return res.json({
            success: true,
            message: 'Tool deactivated',
            data: updatedToolDeactivated
          });
        
        default:
          return res.status(400).json({ 
            success: false, 
            message: `Unknown action: ${action}`
          });
      }
    } catch (error) {
      console.error('Error in headless operation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check endpoint for monitoring
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  return httpServer;
}
