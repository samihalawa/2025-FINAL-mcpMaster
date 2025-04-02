import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertConfigurationSchema, insertCommandLogSchema } from "@shared/schema";
import { z } from "zod";
import WebSocket from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocket.Server({ server: httpServer });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("WebSocket message received:", data);
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });
    
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // Helper function to broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  };

  // Server management routes
  app.get("/api/servers", async (req, res) => {
    const servers = await storage.getAllServers();
    res.json(servers);
  });

  app.get("/api/servers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServerById(id);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    res.json(server);
  });

  app.post("/api/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      broadcastUpdate("server-created", server);
      res.status(201).json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create server" });
    }
  });

  app.patch("/api/servers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    try {
      // Partial validation allows updating only some fields
      const validatedData = insertServerSchema.partial().parse(req.body);
      const server = await storage.updateServer(id, validatedData);
      
      if (!server) {
        return res.status(404).json({ message: "Server not found" });
      }
      
      broadcastUpdate("server-updated", server);
      res.json(server);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid server data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update server" });
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const deleted = await storage.deleteServer(id);
    if (!deleted) {
      return res.status(404).json({ message: "Server not found" });
    }

    broadcastUpdate("server-deleted", { id });
    res.status(204).send();
  });

  // Server control operations
  app.post("/api/servers/:id/start", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServerById(id);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Simulate starting the server
    const updatedServer = await storage.updateServer(id, { 
      status: "active",
      cpuUsage: Math.floor(Math.random() * 30) + 10, // Random CPU usage between 10-40%
      memory: Math.floor(Math.random() * 1500) + 1000, // Random memory between 1000-2500 MB
      uptime: 0,
      lastActive: new Date()
    });

    // Log the command
    await storage.addCommandLog({
      command: `start ${server.name}`,
      output: `${server.name} started successfully`,
      status: "success"
    });

    broadcastUpdate("server-started", updatedServer);
    res.json(updatedServer);
  });

  app.post("/api/servers/:id/stop", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServerById(id);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Simulate stopping the server
    const updatedServer = await storage.updateServer(id, { 
      status: "inactive",
      cpuUsage: 0,
      memory: 0,
      uptime: 0
    });

    // Log the command
    await storage.addCommandLog({
      command: `stop ${server.name}`,
      output: `${server.name} stopped successfully`,
      status: "success"
    });

    broadcastUpdate("server-stopped", updatedServer);
    res.json(updatedServer);
  });

  app.post("/api/servers/:id/restart", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid server ID" });
    }

    const server = await storage.getServerById(id);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    // Simulate restarting the server
    const updatedServer = await storage.updateServer(id, { 
      status: "active",
      cpuUsage: Math.floor(Math.random() * 30) + 10,
      memory: Math.floor(Math.random() * 1500) + 1000,
      uptime: 0,
      lastActive: new Date()
    });

    // Log the command
    await storage.addCommandLog({
      command: `restart ${server.name}`,
      output: `${server.name} restarted successfully`,
      status: "success"
    });

    broadcastUpdate("server-restarted", updatedServer);
    res.json(updatedServer);
  });

  // Configuration routes
  app.get("/api/config/:name", async (req, res) => {
    const name = req.params.name;
    const config = await storage.getConfiguration(name);
    
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    
    res.json(config);
  });

  app.post("/api/config", async (req, res) => {
    try {
      const validatedData = insertConfigurationSchema.parse(req.body);
      const config = await storage.setConfiguration(validatedData);
      broadcastUpdate("config-updated", config);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid configuration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Command logs routes
  app.get("/api/command-logs", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await storage.getCommandLogs(limit);
    res.json(logs);
  });

  app.post("/api/command-logs", async (req, res) => {
    try {
      const validatedData = insertCommandLogSchema.parse(req.body);
      const log = await storage.addCommandLog(validatedData);
      broadcastUpdate("command-log-added", log);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid log data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create log" });
    }
  });

  // Command execution endpoint
  app.post("/api/execute-command", async (req, res) => {
    try {
      const { command } = req.body;
      
      if (!command || typeof command !== "string") {
        return res.status(400).json({ message: "Invalid command" });
      }

      let output = "";
      let status = "success";

      // Process different commands
      if (command.startsWith("list servers")) {
        const servers = await storage.getAllServers();
        output = JSON.stringify(servers.map(s => ({
          name: s.name,
          status: s.status === "active" ? "Running" : "Stopped",
          port: s.port,
          model: s.model
        })));
      } else if (command.startsWith("start server")) {
        const serverName = command.replace("start server", "").trim();
        const server = await storage.getServerByName(serverName);
        
        if (server) {
          await storage.updateServer(server.id, { 
            status: "active",
            cpuUsage: Math.floor(Math.random() * 30) + 10,
            memory: Math.floor(Math.random() * 1500) + 1000,
            uptime: 0,
            lastActive: new Date()
          });
          output = `Server ${serverName} started successfully`;
        } else {
          output = `Server ${serverName} not found`;
          status = "error";
        }
      } else if (command.startsWith("stop server")) {
        const serverName = command.replace("stop server", "").trim();
        const server = await storage.getServerByName(serverName);
        
        if (server) {
          await storage.updateServer(server.id, { 
            status: "inactive",
            cpuUsage: 0,
            memory: 0,
            uptime: 0
          });
          output = `Server ${serverName} stopped successfully`;
        } else {
          output = `Server ${serverName} not found`;
          status = "error";
        }
      } else if (command === "check updates") {
        output = "Updates available for: Cursor MCP (claude-3-opus to claude-3.5-sonnet)";
      } else if (command === "sync config") {
        output = "Configuration synchronized successfully with all running servers";
      } else {
        output = `Unknown command: ${command}`;
        status = "error";
      }

      // Log the command
      const log = await storage.addCommandLog({
        command,
        output,
        status
      });

      broadcastUpdate("command-executed", { command, output, status });
      res.json({ output, status });
    } catch (error) {
      res.status(500).json({ message: "Failed to execute command", error: String(error) });
    }
  });

  // Stats summary route
  app.get("/api/stats", async (req, res) => {
    const servers = await storage.getAllServers();
    
    const activeServers = servers.filter(s => s.status === "active").length;
    const warningServers = servers.filter(s => s.status === "warning").length;
    const inactiveServers = servers.filter(s => s.status === "inactive").length;
    
    res.json({
      activeServers,
      warningServers,
      inactiveServers,
      totalServers: servers.length
    });
  });

  return httpServer;
}
