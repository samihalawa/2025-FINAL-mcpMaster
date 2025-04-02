import { 
  users, type User, type InsertUser, 
  servers, type Server, type InsertServer,
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
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private apps: Map<number, App>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private serverIdCounter: number;
  private appIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.apps = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.serverIdCounter = 1;
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
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async getActivitiesByServerId(serverId: number, limit?: number): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .filter(activity => activity.serverId === serverId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
