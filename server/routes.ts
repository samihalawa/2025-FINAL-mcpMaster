import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertServerSchema, insertAppSchema, insertActivitySchema, insertToolSchema,
  type InsertServer, type InsertApp, type InsertActivity, type InsertTool
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { z } from "zod";
import fetch from "node-fetch";
import { config } from "./config";
import { 
  registryCategories, discoverGitHubServers, discoverSmitheryPackages, 
  searchRegistry, installServer, uninstallServer, startServer, stopServer, getServerStatus, MCPServer
} from "./registry-manager";

// Import WebSocket from ws (needed to access OPEN status)
import { WebSocket as WSType } from "ws";

/**
 * Register routes for Express application
 * @param app Express application
 * @returns HTTP server
 */
export async function registerRoutes(app: Express): Promise<Server> {
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" }); // Use fixed path for WebSocket

  // WebSocket connection handler
  wss.on("connection", handleWebSocketConnection);

  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Server management API
  app.get("/api/servers", async (_req, res) => {
    const servers = await storage.getServers();
    res.json(servers);
  });

  app.get("/api/servers/:id", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServer(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    res.json(server);
  });

  app.post("/api/servers", async (req, res) => {
    try {
      const insertServer = insertServerSchema.parse(req.body);
      const server = await storage.createServer(insertServer);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.put("/api/servers/:id", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    try {
      const updateServer = insertServerSchema.partial().parse(req.body);
      const server = await storage.updateServer(serverId, updateServer);
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      throw error;
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const success = await storage.deleteServer(serverId);
    if (!success) {
      return res.status(404).json({ message: "Server not found" });
    }

    res.status(204).end();
  });

  // Tool management API
  app.get("/api/tools", async (_req, res) => {
    const tools = await storage.getTools();
    res.json(tools);
  });

  app.get("/api/tools/:id", async (req, res) => {
    const toolId = parseInt(req.params.id, 10);
    if (isNaN(toolId)) {
      return res.status(400).json({ message: "Invalid tool ID" });
    }

    const tool = await storage.getTool(toolId);
    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    res.json(tool);
  });

  // Get tools for a specific server
  app.get("/api/servers/:id/tools", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServer(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const tools = await storage.getToolsByServerId(serverId);
    res.json(tools);
  });

  // Registry API endpoints (MCP Dockmaster style)
  app.get("/api/registry/categories", (_req, res) => {
    res.json(registryCategories);
  });

  // Search for MCP servers in the registry
  app.get("/api/registry/search", async (req, res) => {
    const query = req.query.q as string || "";
    const category = req.query.category as string || "all";
    
    if (!registryCategories.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Valid categories are: ${registryCategories.join(', ')}`
      });
    }
    
    try {
      const results = await searchRegistry(query, category);
      res.json({ servers: results });
    } catch (error) {
      console.error("Error searching registry:", error);
      res.status(500).json({ 
        error: "Failed to search registry", 
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Discover new MCP servers
  app.post("/api/registry/discover", async (req, res) => {
    try {
      // Run discovery process concurrently
      const [githubServers, smitheryPackages] = await Promise.all([
        discoverGitHubServers(),
        discoverSmitheryPackages()
      ]);
      
      const servers = [...githubServers, ...smitheryPackages];
      
      return res.json({ 
        success: true, 
        discoveredServers: servers.length,
        servers
      });
    } catch (error) {
      console.error("Error discovering servers:", error);
      res.status(500).json({ 
        error: "Failed to discover servers", 
        message: "Error discovering servers", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Install a server from the registry
  app.post("/api/registry/install/:id", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }
    
    try {
      const server = await installServer(serverId);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json({ 
        message: "Installation started", 
        server 
      });
    } catch (error) {
      console.error(`Error installing server ${serverId}:`, error);
      res.status(500).json({ 
        message: "Error installing server", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Uninstall a server
  app.post("/api/registry/uninstall/:id", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }
    
    try {
      const server = await uninstallServer(serverId);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      res.json({ 
        message: "Uninstallation started", 
        server 
      });
    } catch (error) {
      console.error(`Error uninstalling server ${serverId}:`, error);
      res.status(500).json({ 
        message: "Error uninstalling server", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Get all activities
  app.get("/api/activities", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });

  // Get activities for a specific server
  app.get("/api/servers/:id/activities", async (req, res) => {
    const serverId = parseInt(req.params.id, 10);
    if (isNaN(serverId)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const activities = await storage.getActivitiesByServerId(serverId, limit);
    res.json(activities);
  });

  return server;
}

/**
 * Handle WebSocket connection
 * @param ws WebSocket connection
 */
function handleWebSocketConnection(ws: WebSocket) {
  ws.on("message", async (message) => {
    try {
      const request = JSON.parse(message.toString());
      
      // Process JSON-RPC request
      if (request.jsonrpc === "2.0" && request.method) {
        const response = await handleJsonRpcRequest(request);
        ws.send(JSON.stringify(response));
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
          data: error instanceof Error ? error.message : String(error)
        }
      }));
    }
  });
}

/**
 * Handle JSON-RPC request
 * @param request JSON-RPC request
 * @returns JSON-RPC response
 */
async function handleJsonRpcRequest(request: any) {
  const { id, method, params } = request;
  
  // Default response structure
  const response = {
    jsonrpc: "2.0",
    id
  };
  
  try {
    switch (method) {
      case "ping":
        return {
          ...response,
          result: { 
            pong: true, 
            timestamp: new Date().toISOString() 
          }
        };
        
      case "getServers":
        const servers = await storage.getServers();
        return {
          ...response,
          result: servers
        };
        
      case "getServer":
        if (!params || !params.id) {
          throw new Error("Server ID is required");
        }
        
        const server = await storage.getServer(params.id);
        if (!server) {
          throw new Error("Server not found");
        }
        
        return {
          ...response,
          result: server
        };
        
      case "toggleWorker":
        if (!params || !params.id) {
          throw new Error("Server ID is required");
        }
        
        const serverToToggle = await storage.getServer(params.id);
        if (!serverToToggle) {
          throw new Error("Server not found");
        }
        
        const updatedServer = await storage.updateServer(params.id, {
          isWorker: !serverToToggle.isWorker
        });
        
        return {
          ...response,
          result: updatedServer
        };
        
      case "getTools":
        const tools = await storage.getTools();
        return {
          ...response,
          result: tools
        };
        
      case "getToolsByServer":
        if (!params || !params.serverId) {
          throw new Error("Server ID is required");
        }
        
        const serverTools = await storage.getToolsByServerId(params.serverId);
        return {
          ...response,
          result: serverTools
        };
        
      case "activateTool":
        if (!params || !params.id) {
          throw new Error("Tool ID is required");
        }
        
        const toolToActivate = await storage.getTool(params.id);
        if (!toolToActivate) {
          throw new Error("Tool not found");
        }
        
        const activatedTool = await storage.updateTool(params.id, {
          active: true
        });
        
        return {
          ...response,
          result: activatedTool
        };
        
      case "deactivateTool":
        if (!params || !params.id) {
          throw new Error("Tool ID is required");
        }
        
        const toolToDeactivate = await storage.getTool(params.id);
        if (!toolToDeactivate) {
          throw new Error("Tool not found");
        }
        
        const deactivatedTool = await storage.updateTool(params.id, {
          active: false
        });
        
        return {
          ...response,
          result: deactivatedTool
        };
        
      case "getStats":
        // Get all servers
        const allServers = await storage.getServers();
        
        // Get active servers count
        const activeServers = allServers.filter(s => s.status === "active");
        
        // Get all tools
        const allTools = await storage.getTools();
        
        // Get active tools count
        const activeTools = allTools.filter(t => t.active);
        
        // Get recent activities
        const recentActivities = await storage.getActivities(10);
        
        return {
          ...response,
          result: {
            servers: {
              total: allServers.length,
              active: activeServers.length
            },
            tools: {
              total: allTools.length,
              active: activeTools.length
            },
            activities: recentActivities
          }
        };
        
      // Unknown method
      default:
        throw new Error(`Method not found: ${method}`);
    }
  } catch (error) {
    return {
      ...response,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : String(error)
      }
    };
  }
}
