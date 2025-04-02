import {
  users, type User, type InsertUser,
  servers, type Server, type InsertServer,
  configurations, type Configuration, type InsertConfiguration,
  commandLogs, type CommandLog, type InsertCommandLog,
  SERVER_STATUS
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Server operations
  getAllServers(): Promise<Server[]>;
  getServerById(id: number): Promise<Server | undefined>;
  getServerByName(name: string): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: number): Promise<boolean>;
  
  // Configuration operations
  getConfiguration(name: string): Promise<Configuration | undefined>;
  setConfiguration(config: InsertConfiguration): Promise<Configuration>;
  
  // Command log operations
  getCommandLogs(limit?: number): Promise<CommandLog[]>;
  addCommandLog(log: InsertCommandLog): Promise<CommandLog>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private servers: Map<number, Server>;
  private configurations: Map<string, Configuration>;
  private commandLogs: CommandLog[];
  
  private userId: number;
  private serverId: number;
  private configId: number;
  private logId: number;

  constructor() {
    this.users = new Map();
    this.servers = new Map();
    this.configurations = new Map();
    this.commandLogs = [];
    
    this.userId = 1;
    this.serverId = 1;
    this.configId = 1;
    this.logId = 1;
    
    // Initialize with sample data
    this.initializeDefaultData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Server operations
  async getAllServers(): Promise<Server[]> {
    return Array.from(this.servers.values());
  }

  async getServerById(id: number): Promise<Server | undefined> {
    return this.servers.get(id);
  }

  async getServerByName(name: string): Promise<Server | undefined> {
    return Array.from(this.servers.values()).find(
      (server) => server.name === name,
    );
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const id = this.serverId++;
    const now = new Date();
    const server: Server = { 
      ...insertServer, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.servers.set(id, server);
    return server;
  }

  async updateServer(id: number, partial: Partial<InsertServer>): Promise<Server | undefined> {
    const server = this.servers.get(id);
    if (!server) return undefined;
    
    const updated: Server = {
      ...server,
      ...partial,
      updatedAt: new Date(),
    };
    
    this.servers.set(id, updated);
    return updated;
  }

  async deleteServer(id: number): Promise<boolean> {
    return this.servers.delete(id);
  }

  // Configuration operations
  async getConfiguration(name: string): Promise<Configuration | undefined> {
    return this.configurations.get(name);
  }

  async setConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const existing = this.configurations.get(insertConfig.name);
    
    const config: Configuration = {
      id: existing?.id ?? this.configId++,
      name: insertConfig.name,
      value: insertConfig.value,
      updatedAt: new Date(),
    };
    
    this.configurations.set(config.name, config);
    return config;
  }

  // Command log operations
  async getCommandLogs(limit: number = 100): Promise<CommandLog[]> {
    // Return logs in reverse chronological order (newest first)
    return this.commandLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async addCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = this.logId++;
    const log: CommandLog = {
      ...insertLog,
      id,
      timestamp: new Date(),
    };
    
    this.commandLogs.push(log);
    return log;
  }

  // Initialize with default data
  private initializeDefaultData() {
    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin", // Not secure, just for demo
      isAdmin: true,
    });

    // Add sample servers
    this.createServer({
      name: "Claude Desktop MCP",
      status: SERVER_STATUS.ACTIVE,
      port: 11434,
      model: "claude-3.5-sonnet",
      autoStart: true,
      cpuUsage: 35,
      memory: 2400, // MB
      uptime: 12240, // 3h 24m in seconds
      lastActive: new Date(),
      config: {
        contextWindow: 200000,
        temperature: 0.7,
      },
      connectedApps: ["Claude Desktop", "Cursor"],
    });

    this.createServer({
      name: "Cursor MCP",
      status: SERVER_STATUS.WARNING,
      port: 11435,
      model: "claude-3-opus",
      autoStart: true,
      cpuUsage: 22,
      memory: 1800, // MB
      uptime: 43500, // 12h 5m in seconds
      lastActive: new Date(),
      config: {
        contextWindow: 100000,
        temperature: 0.5,
      },
      connectedApps: ["Cursor"],
    });

    this.createServer({
      name: "Cline MCP",
      status: SERVER_STATUS.INACTIVE,
      port: 11436,
      model: "claude-3.5-sonnet",
      autoStart: false,
      cpuUsage: 0,
      memory: 0,
      uptime: 0,
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      config: {
        contextWindow: 100000,
        temperature: 0.7,
      },
      connectedApps: ["Cline"],
    });

    // Add global configuration
    this.setConfiguration({
      name: "global",
      value: {
        defaultModel: "claude-3.5-sonnet",
        defaultPort: 11434,
        apiKeySource: "environment",
        logLevel: "info",
        updateCheck: "daily",
        logDirectory: "./logs",
        maxLogs: 50
      }
    });

    // Add sample command logs
    this.addCommandLog({
      command: "init",
      output: "MCP Commander initialized",
      status: "success"
    });
    
    this.addCommandLog({
      command: "scan",
      output: "Found 3 MCP configurations",
      status: "success"
    });
    
    this.addCommandLog({
      command: "start Claude Desktop MCP",
      output: "Claude Desktop MCP server started successfully",
      status: "success"
    });
    
    this.addCommandLog({
      command: "start Cursor MCP",
      output: "Cursor MCP server started successfully",
      status: "success"
    });
    
    this.addCommandLog({
      command: "list servers",
      output: JSON.stringify([
        { name: "Claude Desktop", status: "Running", port: 11434, model: "Claude 3.5 Sonnet" },
        { name: "Cursor", status: "Running", port: 11435, model: "Claude 3.0 Opus" },
        { name: "Cline", status: "Stopped", port: 11436, model: "Claude 3.5 Sonnet" }
      ]),
      status: "success"
    });
  }
}

export const storage = new MemStorage();
