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
    // Create a single MCP Manager server
    const mcpManager: Server = {
      id: this.serverIdCounter++,
      name: "MCP Manager",
      type: "local",
      address: "localhost",
      port: 50050,
      status: "active",
      cpuUsage: 0,
      memoryUsage: 0,
      totalMemory: 8,
      models: ["Claude-3-Opus", "Claude-3-Sonnet", "Claude-3-Haiku", "GPT-4"],
      createdAt: new Date(),
      lastActive: new Date(),
      isWorker: true,
      // Additional fields required by schema
      repository: null,
      version: null,
      description: null,
      stars: null,
      forks: null,
      owner: null,
      smitheryPackage: null,
      apiKey: null,
      commandConfig: null
    };
    
    this.servers.set(mcpManager.id, mcpManager);
    
    // Create a Smithery Package Manager tool
    const smitheryTool: Tool = {
      id: this.toolIdCounter++,
      name: "smithery_manager",
      description: "Tool for installing and managing Smithery MCP packages",
      shortDescription: "Manage Smithery packages",
      serverId: mcpManager.id,
      installed: true,
      active: true,
      categories: ["admin", "smithery"],
      inputSchema: {
        description: "Smithery package installation parameters",
        properties: {
          packageId: {
            type: "string",
            description: "The ID of the Smithery package to install"
          },
          apiKey: {
            type: "string",
            description: "API key for authentication with the Smithery package"
          },
          config: {
            type: "object",
            description: "Additional configuration for the Smithery package",
            additionalProperties: true
          }
        },
        required: ["packageId"],
        type: "object"
      },
      createdAt: new Date(),
      lastUsed: null
    };
    
    this.tools.set(smitheryTool.id, smitheryTool);
    
    // Create a single initialization activity
    const initActivity = {
      id: this.activityIdCounter++,
      type: "success",
      message: "MCP Manager initialized",
      serverId: mcpManager.id,
      appId: null,
      toolId: null,
      createdAt: new Date()
    };
    
    this.activities.set(initActivity.id, initActivity as Activity);
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
      lastActive: new Date(),
      // Ensure all fields required by the schema are present
      repository: insertServer.repository || null,
      version: insertServer.version || null,
      description: insertServer.description || null,
      stars: insertServer.stars || null,
      forks: insertServer.forks || null,
      owner: insertServer.owner || null,
      smitheryPackage: insertServer.smitheryPackage || null,
      apiKey: insertServer.apiKey || null,
      commandConfig: insertServer.commandConfig || null
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
