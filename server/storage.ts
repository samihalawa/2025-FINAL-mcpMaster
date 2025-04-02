import { 
  users, type User, type InsertUser, 
  servers, type Server, type InsertServer,
  tools, type Tool, type InsertTool,
  apps, type App, type InsertApp,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Server methods
  getServer(id: number): Promise<Server | undefined>;
  getServers(): Promise<Server[]>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  
  // Tool methods
  getTool(id: number): Promise<Tool | undefined>;
  getTools(): Promise<Tool[]>;
  getToolsByServerId(serverId: number): Promise<Tool[]>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;
  
  // App methods
  getApp(id: number): Promise<App | undefined>;
  getApps(): Promise<App[]>;
  getAppsByServerId(serverId: number): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: number, app: Partial<InsertApp>): Promise<App | undefined>;
  deleteApp(id: number): Promise<boolean>;
  
  // Activity methods
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByServerId(serverId: number, limit?: number): Promise<Activity[]>;
  getActivitiesByToolId(toolId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private tools: Map<number, Tool>;
  private apps: Map<number, App>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private serverIdCounter: number;
  private toolIdCounter: number;
  private appIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.tools = new Map();
    this.apps = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.serverIdCounter = 1;
    this.toolIdCounter = 1;
    this.appIdCounter = 1;
    this.activityIdCounter = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample servers
    const server1: Server = {
      id: this.serverIdCounter++,
      name: "Primary Server",
      type: "local",
      address: "localhost",
      port: 8080,
      status: "active",
      cpuUsage: 24,
      memoryUsage: 2.1,
      totalMemory: 8,
      models: ["Claude-3-Opus", "Claude-3-Sonnet", "GPT-4", "GPT-3.5-Turbo"],
      createdAt: new Date(),
      lastActive: new Date(),
      isWorker: true
    };
    
    const server2: Server = {
      id: this.serverIdCounter++,
      name: "Claude Server",
      type: "remote",
      address: "192.168.1.5",
      port: 8040,
      status: "active",
      cpuUsage: 68,
      memoryUsage: 5.4,
      totalMemory: 8,
      models: ["Claude-3-Opus", "Claude-3-Sonnet"],
      createdAt: new Date(),
      lastActive: new Date(),
      isWorker: false
    };
    
    const server3: Server = {
      id: this.serverIdCounter++,
      name: "Cursor Server",
      type: "remote",
      address: "cursor.mcp",
      port: 9000,
      status: "warning",
      cpuUsage: 12,
      memoryUsage: 0.8,
      totalMemory: 4,
      models: ["GPT-4"],
      createdAt: new Date(),
      lastActive: new Date(),
      isWorker: false
    };
    
    this.servers.set(server1.id, server1);
    this.servers.set(server2.id, server2);
    this.servers.set(server3.id, server3);
    
    // Sample apps
    const app1: App = {
      id: this.appIdCounter++,
      name: "Claude Desktop",
      type: "Desktop App",
      version: "2.1.0",
      serverId: server1.id,
      status: "active",
      lastActive: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    };
    
    const app2: App = {
      id: this.appIdCounter++,
      name: "Cursor",
      type: "IDE",
      version: "1.5.2",
      serverId: server3.id,
      status: "warning",
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    
    const app3: App = {
      id: this.appIdCounter++,
      name: "Cline",
      type: "CLI Tool",
      version: "0.9.1",
      serverId: server1.id,
      status: "inactive",
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    };
    
    const app4: App = {
      id: this.appIdCounter++,
      name: "Web Interface",
      type: "Web App",
      version: "Browser",
      serverId: server2.id,
      status: "active",
      lastActive: new Date()
    };
    
    this.apps.set(app1.id, app1);
    this.apps.set(app2.id, app2);
    this.apps.set(app3.id, app3);
    this.apps.set(app4.id, app4);
    
    // Sample activities
    const activities = [
      {
        id: this.activityIdCounter++,
        type: "success",
        message: "Server started successfully",
        serverId: server1.id,
        appId: null,
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        id: this.activityIdCounter++,
        type: "info",
        message: "Configuration synchronized",
        serverId: null,
        appId: null,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: this.activityIdCounter++,
        type: "warning",
        message: "Connection warning",
        serverId: server3.id,
        appId: null,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: this.activityIdCounter++,
        type: "info",
        message: "New application connected",
        serverId: server2.id,
        appId: app4.id,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
      },
      {
        id: this.activityIdCounter++,
        type: "success",
        message: "Model added successfully",
        serverId: server2.id,
        appId: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];
    
    activities.forEach(activity => {
      this.activities.set(activity.id, activity as Activity);
    });
    
    // Sample tools
    const searchTool: Tool = {
      id: this.toolIdCounter++,
      name: "mcp_search",
      description: "Searches for information across connected MCP servers and tools",
      shortDescription: "Search for information",
      serverId: server1.id,
      installed: true,
      active: true,
      categories: ["utility", "search"],
      inputSchema: {
        description: "Search parameters for the MCP search tool",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          exact: {
            type: "boolean",
            description: "Whether to perform an exact match search",
            default: false
          }
        },
        required: ["query"],
        type: "object"
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
    };
    
    const configTool: Tool = {
      id: this.toolIdCounter++,
      name: "mcp_config",
      description: "Configure MCP settings and parameters",
      shortDescription: "Configuration utility",
      serverId: server1.id,
      installed: true,
      active: true,
      categories: ["utility", "configuration"],
      inputSchema: {
        description: "Configuration parameters",
        properties: {
          tool_id: {
            type: "string",
            description: "The ID of the tool to configure"
          },
          config: {
            type: "object",
            description: "Configuration object with settings",
            additionalProperties: true
          }
        },
        required: ["tool_id", "config"],
        type: "object"
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };
    
    const installTool: Tool = {
      id: this.toolIdCounter++,
      name: "mcp_install",
      description: "Install tools from the MCP registry",
      shortDescription: "Tool installer",
      serverId: server1.id,
      installed: true,
      active: true,
      categories: ["utility", "installation"],
      inputSchema: {
        description: "Installation parameters",
        properties: {
          tool_id: {
            type: "string",
            description: "The ID of the tool to install"
          }
        },
        required: ["tool_id"],
        type: "object"
      },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    };
    
    this.tools.set(searchTool.id, searchTool);
    this.tools.set(configTool.id, configTool);
    this.tools.set(installTool.id, installTool);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Server methods
  async getServer(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }
  
  async getServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }
  
  async createServer(insertServer: InsertServer): Promise<Server> {
    const id = this.serverIdCounter++;
    const server: Server = { 
      ...insertServer, 
      id, 
      status: insertServer.status || "inactive",
      cpuUsage: insertServer.cpuUsage ?? 0,
      memoryUsage: insertServer.memoryUsage ?? 0,
      totalMemory: insertServer.totalMemory ?? 8,
      models: insertServer.models || [],
      isWorker: insertServer.isWorker ?? false,
      createdAt: new Date(), 
      lastActive: new Date()
    };
    this.servers.set(id, server);
    
    // Create activity log
    await this.createActivity({
      type: "success",
      message: `Server '${server.name}' created successfully`,
      serverId: server.id,
      appId: null
    });
    
    return server;
  }
  
  async updateServer(id: number, updatedFields: Partial<InsertServer>): Promise<Server | undefined> {
    const server = this.servers.get(id);
    if (!server) return undefined;
    
    const updatedServer: Server = {
      ...server,
      ...updatedFields,
      lastActive: new Date()
    };
    
    this.servers.set(id, updatedServer);
    
    // Create activity log
    await this.createActivity({
      type: "info",
      message: `Server '${server.name}' updated`,
      serverId: server.id,
      appId: null
    });
    
    return updatedServer;
  }
  
  async deleteServer(id: number): Promise<boolean> {
    const server = this.servers.get(id);
    if (!server) return false;
    
    const success = this.servers.delete(id);
    
    // Create activity log
    if (success) {
      await this.createActivity({
        type: "info",
        message: `Server '${server.name}' deleted`,
        serverId: null,
        appId: null
      });
    }
    
    return success;
  }
  
  // Tool methods
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }
  
  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }
  
  async getToolsByServerId(serverId: number): Promise<Tool[]> {
    return Array.from(this.tools.values()).filter(tool => tool.serverId === serverId);
  }
  
  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.toolIdCounter++;
    const tool: Tool = { 
      ...insertTool, 
      id,
      shortDescription: insertTool.shortDescription || null,
      active: insertTool.active || false,
      installed: insertTool.installed || false,
      categories: insertTool.categories || [],
      createdAt: new Date(),
      lastUsed: null
    };
    
    this.tools.set(id, tool);
    
    // Create activity log
    await this.createActivity({
      type: "success",
      message: `Tool '${tool.name}' created`,
      serverId: tool.serverId,
      appId: null,
      toolId: tool.id
    });
    
    return tool;
  }
  
  async updateTool(id: number, updatedFields: Partial<InsertTool>): Promise<Tool | undefined> {
    const tool = this.tools.get(id);
    if (!tool) return undefined;
    
    const updatedTool: Tool = {
      ...tool,
      ...updatedFields,
      lastUsed: updatedFields.active ? new Date() : tool.lastUsed
    };
    
    this.tools.set(id, updatedTool);
    
    // Create activity log
    await this.createActivity({
      type: "info",
      message: `Tool '${tool.name}' updated`,
      serverId: tool.serverId,
      appId: null,
      toolId: tool.id
    });
    
    return updatedTool;
  }
  
  async deleteTool(id: number): Promise<boolean> {
    const tool = this.tools.get(id);
    if (!tool) return false;
    
    const success = this.tools.delete(id);
    
    // Create activity log
    if (success) {
      await this.createActivity({
        type: "info",
        message: `Tool '${tool.name}' deleted`,
        serverId: tool.serverId,
        appId: null,
        toolId: null
      });
    }
    
    return success;
  }
  
  // App methods
  async getApp(id: number): Promise<App | undefined> {
    return this.apps.get(id);
  }
  
  async getApps(): Promise<App[]> {
    return Array.from(this.apps.values());
  }
  
  async getAppsByServerId(serverId: number): Promise<App[]> {
    return Array.from(this.apps.values()).filter(app => app.serverId === serverId);
  }
  
  async createApp(insertApp: InsertApp): Promise<App> {
    const id = this.appIdCounter++;
    const app: App = { 
      ...insertApp, 
      id,
      status: insertApp.status || "inactive",
      version: insertApp.version || null,
      lastActive: new Date() 
    };
    this.apps.set(id, app);
    
    // Create activity log
    await this.createActivity({
      type: "info",
      message: `App '${app.name}' connected`,
      serverId: app.serverId,
      appId: app.id
    });
    
    return app;
  }
  
  async updateApp(id: number, updatedFields: Partial<InsertApp>): Promise<App | undefined> {
    const app = this.apps.get(id);
    if (!app) return undefined;
    
    const updatedApp: App = {
      ...app,
      ...updatedFields,
      lastActive: new Date()
    };
    
    this.apps.set(id, updatedApp);
    return updatedApp;
  }
  
  async deleteApp(id: number): Promise<boolean> {
    const app = this.apps.get(id);
    if (!app) return false;
    
    const success = this.apps.delete(id);
    
    // Create activity log
    if (success) {
      await this.createActivity({
        type: "info",
        message: `App '${app.name}' disconnected`,
        serverId: app.serverId,
        appId: null
      });
    }
    
    return success;
  }
  
  // Activity methods
  async getActivities(limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => {
        if (a.createdAt instanceof Date && b.createdAt instanceof Date) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async getActivitiesByServerId(serverId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.serverId === serverId)
      .sort((a, b) => {
        if (a.createdAt instanceof Date && b.createdAt instanceof Date) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async getActivitiesByToolId(toolId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.toolId === toolId)
      .sort((a, b) => {
        if (a.createdAt instanceof Date && b.createdAt instanceof Date) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      serverId: insertActivity.serverId ?? null,
      appId: insertActivity.appId ?? null,
      toolId: insertActivity.toolId ?? null,
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
