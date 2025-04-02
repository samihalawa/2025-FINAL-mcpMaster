import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertAppSchema, insertActivitySchema, insertToolSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { WebSocketServer } from "ws";
import type { WebSocket } from "ws";
import { z } from "zod";

// Import WebSocket from ws (needed to access OPEN status)
import { WebSocket as WSType } from "ws";

// Registry data structure to handle MCP tool registry
interface RegistryTool {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  publisher: {
    id: string;
    name: string;
    url: string;
  };
  isOfficial: boolean;
  sourceUrl: string;
  categories: string[];
  tags: string[];
  stars?: number;
  downloads?: number;
  lastUpdated?: string;
  compatibleWith?: string[];
}

interface RegistryCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  featured: boolean;
}

// Mock registry data (in a real app, this would come from external APIs/databases)
const registryCategories: RegistryCategory[] = [
  {
    id: "language-models",
    name: "Language Models",
    description: "Tools for working with large language models and text generation",
    count: 158,
    featured: true
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Tools for creating and manipulating images with AI",
    count: 97,
    featured: true
  },
  {
    id: "audio",
    name: "Audio Processing",
    description: "Tools for speech recognition, text-to-speech, and audio analysis",
    count: 64,
    featured: false
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description: "Tools for analyzing and visualizing data",
    count: 112,
    featured: true
  },
  {
    id: "agents",
    name: "AI Agents",
    description: "Autonomous AI agents and assistants",
    count: 76,
    featured: true
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Helper tools for MCP servers",
    count: 189,
    featured: false
  },
  {
    id: "connectors",
    name: "API Connectors",
    description: "Tools to connect to external APIs and services",
    count: 205,
    featured: true
  }
];

// Registry tools database (would be fetched from external sources in production)
const registryTools: RegistryTool[] = [
  {
    id: "mcp-openai-proxy",
    name: "OpenAI API Proxy",
    description: "Proxy OpenAI API calls through MCP with additional features like caching, retries, and rate limiting",
    shortDescription: "Proxy for OpenAI API with advanced features",
    publisher: {
      id: "mcp-official",
      name: "MCP Official",
      url: "https://github.com/mcp-project/mcp-tools"
    },
    isOfficial: true,
    sourceUrl: "https://github.com/mcp-project/mcp-tools/openai-proxy",
    categories: ["connectors", "language-models"],
    tags: ["openai", "proxy", "api", "gpt"],
    stars: 847,
    downloads: 28945,
    lastUpdated: "2025-03-15T14:22:45Z",
    compatibleWith: ["local", "docker", "cloud"]
  },
  {
    id: "mcp-anthropic-connector",
    name: "Anthropic Claude Connector",
    description: "Connect to Anthropic's Claude models through a standardized MCP interface with support for all Claude models and streaming",
    shortDescription: "Claude API connector with streaming support",
    publisher: {
      id: "mcp-official",
      name: "MCP Official",
      url: "https://github.com/mcp-project/mcp-tools"
    },
    isOfficial: true,
    sourceUrl: "https://github.com/mcp-project/mcp-tools/anthropic",
    categories: ["connectors", "language-models"],
    tags: ["anthropic", "claude", "api"],
    stars: 721,
    downloads: 24312,
    lastUpdated: "2025-03-18T09:15:30Z",
    compatibleWith: ["local", "docker", "cloud"]
  },
  {
    id: "mcp-agent-framework",
    name: "MCP Agent Framework",
    description: "Build autonomous agents that can use multiple models and tools through MCP connections. Includes planning, memory, and tool usage capabilities",
    shortDescription: "Framework for building autonomous AI agents",
    publisher: {
      id: "mcp-official",
      name: "MCP Official",
      url: "https://github.com/mcp-project/mcp-tools"
    },
    isOfficial: true,
    sourceUrl: "https://github.com/mcp-project/mcp-tools/agent-framework",
    categories: ["agents"],
    tags: ["agents", "autonomous", "framework"],
    stars: 1052,
    downloads: 18754,
    lastUpdated: "2025-03-22T11:45:12Z",
    compatibleWith: ["local", "docker", "cloud"]
  },
  {
    id: "mcp-stable-diffusion",
    name: "Stable Diffusion MCP Interface",
    description: "Run Stable Diffusion models through MCP with support for txt2img, img2img, inpainting, and more",
    shortDescription: "Stable Diffusion integration for MCP",
    publisher: {
      id: "sd-community",
      name: "SD Community",
      url: "https://github.com/sd-community/mcp-sd"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/sd-community/mcp-sd",
    categories: ["image-generation"],
    tags: ["stable-diffusion", "image", "generation"],
    stars: 634,
    downloads: 15982,
    lastUpdated: "2025-03-10T16:32:22Z",
    compatibleWith: ["local", "docker"]
  },
  {
    id: "mcp-whisper",
    name: "Whisper Speech Recognition",
    description: "Use OpenAI's Whisper speech recognition models through MCP with additional transcription features",
    shortDescription: "Speech recognition with Whisper",
    publisher: {
      id: "ai-tooling",
      name: "AI Tooling",
      url: "https://github.com/ai-tooling/mcp-whisper"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/ai-tooling/mcp-whisper",
    categories: ["audio"],
    tags: ["whisper", "speech", "transcription"],
    stars: 412,
    downloads: 9874,
    lastUpdated: "2025-03-05T08:11:45Z",
    compatibleWith: ["local", "docker"]
  },
  {
    id: "mcp-llamafile",
    name: "Llamafile Integration",
    description: "Run llamafile models through MCP with automatic downloading and configuration",
    shortDescription: "Llamafile for MCP servers",
    publisher: {
      id: "llama-ecosystem",
      name: "Llama Ecosystem",
      url: "https://github.com/llama-ecosystem/mcp-llamafile"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/llama-ecosystem/mcp-llamafile",
    categories: ["language-models"],
    tags: ["llama", "local", "llamafile"],
    stars: 879,
    downloads: 21354,
    lastUpdated: "2025-03-25T14:22:15Z",
    compatibleWith: ["local", "docker"]
  },
  {
    id: "mcp-vector-store",
    name: "Vector Database Connector",
    description: "Connect to popular vector databases like Pinecone, Qdrant, and Milvus through a unified interface",
    shortDescription: "Unified vector database interface",
    publisher: {
      id: "mcp-official",
      name: "MCP Official",
      url: "https://github.com/mcp-project/mcp-tools"
    },
    isOfficial: true,
    sourceUrl: "https://github.com/mcp-project/mcp-tools/vector-store",
    categories: ["data-analysis", "connectors"],
    tags: ["vectors", "embedding", "database"],
    stars: 548,
    downloads: 11232,
    lastUpdated: "2025-03-20T10:45:30Z",
    compatibleWith: ["local", "docker", "cloud"]
  },
  {
    id: "mcp-data-analyzer",
    name: "Data Analysis Framework",
    description: "Analyze datasets with AI using a comprehensive set of tools for visualization, statistics, and ML",
    shortDescription: "AI-powered data analysis toolkit",
    publisher: {
      id: "data-science-tools",
      name: "Data Science Tools",
      url: "https://github.com/data-science-tools/mcp-analyzer"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/data-science-tools/mcp-analyzer",
    categories: ["data-analysis"],
    tags: ["data", "analysis", "visualization"],
    stars: 498,
    downloads: 8976,
    lastUpdated: "2025-03-12T15:34:22Z",
    compatibleWith: ["local", "docker"]
  },
  {
    id: "mcp-discord-bot",
    name: "Discord Bot Framework",
    description: "Create AI-powered Discord bots using MCP tooling and models",
    shortDescription: "MCP-powered Discord bots",
    publisher: {
      id: "community-ai",
      name: "Community AI",
      url: "https://github.com/community-ai/mcp-discord"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/community-ai/mcp-discord",
    categories: ["connectors", "agents"],
    tags: ["discord", "bot", "integration"],
    stars: 723,
    downloads: 16543,
    lastUpdated: "2025-03-28T09:12:45Z",
    compatibleWith: ["local", "docker", "cloud"]
  },
  {
    id: "mcp-batch-processor",
    name: "Batch Processing System",
    description: "Process large batches of requests to LLMs and other models with queuing and caching",
    shortDescription: "Efficient batch processing for AI tasks",
    publisher: {
      id: "ai-scale",
      name: "AI Scale",
      url: "https://github.com/ai-scale/mcp-batch"
    },
    isOfficial: false,
    sourceUrl: "https://github.com/ai-scale/mcp-batch",
    categories: ["utilities"],
    tags: ["batch", "processing", "queue"],
    stars: 321,
    downloads: 7632,
    lastUpdated: "2025-03-15T16:22:45Z",
    compatibleWith: ["local", "docker", "cloud"]
  }
];

// Helper function to filter registry tools based on search parameters
function filterRegistryTools(
  tools: RegistryTool[],
  query?: string,
  category?: string,
  official?: boolean,
  sort?: 'popular' | 'newest' | 'name',
  compatibility?: string[]
): RegistryTool[] {
  let filtered = [...tools];
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(tool => 
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(tool => 
      tool.categories.includes(category)
    );
  }
  
  // Filter by official status
  if (official !== undefined) {
    filtered = filtered.filter(tool => 
      tool.isOfficial === official
    );
  }
  
  // Filter by compatibility
  if (compatibility && compatibility.length > 0) {
    filtered = filtered.filter(tool => 
      compatibility.some(compat => tool.compatibleWith?.includes(compat))
    );
  }
  
  // Sort results
  if (sort) {
    switch (sort) {
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          if (!a.lastUpdated) return 1;
          if (!b.lastUpdated) return -1;
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
  }
  
  return filtered;
}

// Get featured tools
function getFeaturedTools(limit: number = 5): RegistryTool[] {
  return [...registryTools]
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, limit);
}

// Get trending tools (most downloaded in recent period)
function getTrendingTools(limit: number = 5): RegistryTool[] {
  return [...registryTools]
    .sort((a, b) => {
      // Sort by combination of stars and downloads
      const aScore = (a.stars || 0) * 0.3 + (a.downloads || 0) * 0.7;
      const bScore = (b.stars || 0) * 0.3 + (b.downloads || 0) * 0.7;
      return bScore - aScore;
    })
    .slice(0, limit);
}

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
    
    ws.on('message', async (message: Buffer | string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Check if it's a JSON-RPC message (has jsonrpc property)
        if (data.jsonrpc) {
          // Handle JSON-RPC message for Claude Desktop compatibility
          const response = await handleJsonRpc(data, ws);
          
          // Send the JSON-RPC response
          ws.send(JSON.stringify(response));
        } else {
          // Handle regular command message
          handleWebSocketCommand(data, ws);
        }
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
  
  // Handle JSON-RPC requests
  const handleJsonRpc = async (request: any, ws: WebSocket) => {
    console.log('Received JSON-RPC request:', request);
    
    // Validate JSON-RPC structure
    if (!request.jsonrpc || request.jsonrpc !== '2.0' || !request.method) {
      return {
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      };
    }
    
    try {
      let result: any;
      
      // Handle different JSON-RPC methods
      switch (request.method) {
        case 'ping':
          result = {
            pong: true,
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'getServers':
          result = await storage.getServers();
          break;
          
        case 'getServer':
          if (!request.params || !request.params.id) {
            throw { code: -32602, message: 'Invalid params: id is required' };
          }
          const server = await storage.getServer(Number(request.params.id));
          if (!server) {
            throw { code: -32602, message: 'Server not found' };
          }
          result = server;
          break;
          
        case 'toggleWorker':
          if (!request.params || !request.params.id) {
            throw { code: -32602, message: 'Invalid params: id is required' };
          }
          
          const targetServer = await storage.getServer(Number(request.params.id));
          if (!targetServer) {
            throw { code: -32602, message: 'Server not found' };
          }
          
          const updatedServer = await storage.updateServer(Number(request.params.id), {
            isWorker: !targetServer.isWorker
          });
          
          // Broadcast update to all clients
          broadcastUpdate('server_updated', updatedServer);
          
          result = updatedServer;
          break;
          
        case 'getTools':
          result = await storage.getTools();
          break;
          
        case 'getToolsByServer':
          if (!request.params || !request.params.serverId) {
            throw { code: -32602, message: 'Invalid params: serverId is required' };
          }
          result = await storage.getToolsByServerId(Number(request.params.serverId));
          break;
          
        case 'activateTool':
          if (!request.params || !request.params.id) {
            throw { code: -32602, message: 'Invalid params: id is required' };
          }
          
          const toolToActivate = await storage.getTool(Number(request.params.id));
          if (!toolToActivate) {
            throw { code: -32602, message: 'Tool not found' };
          }
          
          const activatedTool = await storage.updateTool(Number(request.params.id), {
            active: true
          });
          
          // Broadcast update to all clients
          broadcastUpdate('tool_updated', activatedTool);
          
          result = activatedTool;
          break;
        
        case 'deactivateTool':
          if (!request.params || !request.params.id) {
            throw { code: -32602, message: 'Invalid params: id is required' };
          }
          
          const toolToDeactivate = await storage.getTool(Number(request.params.id));
          if (!toolToDeactivate) {
            throw { code: -32602, message: 'Tool not found' };
          }
          
          const deactivatedTool = await storage.updateTool(Number(request.params.id), {
            active: false
          });
          
          // Broadcast update to all clients
          broadcastUpdate('tool_updated', deactivatedTool);
          
          result = deactivatedTool;
          break;
          
        case 'getStats':
          const servers = await storage.getServers();
          const apps = await storage.getApps();
          const tools = await storage.getTools();
          
          result = {
            totalServers: servers.length,
            activeServers: servers.filter(s => s.status === 'active').length,
            warningServers: servers.filter(s => s.status === 'warning').length,
            connectedApps: apps.filter(a => a.status === 'active').length,
            activeTools: tools.filter(t => t.active).length
          };
          break;
          
        default:
          throw { code: -32601, message: `Method not found: ${request.method}` };
      }
      
      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };
    } catch (error) {
      console.error('JSON-RPC error:', error);
      
      if (error && typeof error === 'object' && 'code' in error) {
        return {
          jsonrpc: '2.0',
          id: request.id || null,
          error: {
            code: (error as any).code,
            message: (error as any).message || 'Unknown error'
          }
        };
      }
      
      return {
        jsonrpc: '2.0',
        id: request.id || null,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Internal error'
        }
      };
    }
  };
  
  // Handle WebSocket commands (headless API operations)
  const handleWebSocketCommand = async (data: any, ws: WebSocket) => {
    try {
      if (!data.command) {
        throw new Error('No command specified');
      }
      
      switch (data.command) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            data: { 
              timestamp: new Date().toISOString(),
              message: 'MCP server is alive'
            }
          }));
          break;
          
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
          
        case 'search_registry':
          const query = data.query as string | undefined;
          const category = data.category as string | undefined;
          const official = data.official as boolean | undefined;
          const sort = data.sort as 'popular' | 'newest' | 'name' | undefined;
          const compatibility = data.compatibility as string[] | undefined;
          
          const searchResults = filterRegistryTools(
            registryTools,
            query,
            category,
            official,
            sort,
            compatibility
          );
          
          ws.send(JSON.stringify({
            type: 'registry_search_results',
            data: searchResults
          }));
          break;
          
        case 'get_registry_categories':
          ws.send(JSON.stringify({
            type: 'registry_categories',
            data: registryCategories
          }));
          break;
          
        case 'install_tool':
          if (!data.toolId) {
            throw new Error('Tool ID is required');
          }
          
          if (!data.serverId) {
            throw new Error('Server ID is required');
          }
          
          // Get the server
          const installServer = await storage.getServer(Number(data.serverId));
          if (!installServer) {
            throw new Error('Server not found');
          }
          
          // Find the tool in the registry
          const registryTool = registryTools.find(t => t.id === data.toolId);
          if (!registryTool) {
            throw new Error('Tool not found in registry');
          }
          
          // Check compatibility
          if (registryTool.compatibleWith && !registryTool.compatibleWith.includes(installServer.type)) {
            throw new Error(`Tool is not compatible with server type: ${installServer.type}`);
          }
          
          // Create the tool record in the database
          const newTool = await storage.createTool({
            name: registryTool.name,
            description: registryTool.description,
            shortDescription: registryTool.shortDescription || null,
            serverId: Number(data.serverId),
            installed: true,
            active: false,
            categories: registryTool.categories,
            inputSchema: {
              // Create a simple schema based on the registry tool
              type: "object",
              description: `${registryTool.name} configuration`,
              properties: {
                config: {
                  type: "object",
                  description: "Configuration options"
                }
              },
              required: ["config"]
            }
            // createdAt and lastUsed will be set by the database defaults
          });
          
          // Create activity log
          await storage.createActivity({
            type: "success",
            message: `Installed tool ${registryTool.name} from registry via WebSocket`,
            serverId: Number(data.serverId),
            appId: null,
            toolId: newTool.id
          });
          
          ws.send(JSON.stringify({
            type: 'tool_installed',
            data: {
              tool: newTool,
              fromRegistry: registryTool.id
            }
          }));
          
          // Also broadcast to all clients
          broadcastUpdate('tool_installed', {
            tool: newTool,
            fromRegistry: registryTool.id
          });
          break;
          
        case 'sync_registry':
          // In a real app, this would sync with external registries
          const syncResults = {
            totalSynced: registryTools.length,
            newTools: Math.floor(Math.random() * 5),
            updatedTools: Math.floor(Math.random() * 10),
            timestamp: new Date().toISOString()
          };
          
          // Create activity log
          await storage.createActivity({
            type: "info",
            message: `Synced with registry sources via WebSocket. Found ${syncResults.newTools} new tools.`,
            serverId: null,
            appId: null
          });
          
          ws.send(JSON.stringify({
            type: 'registry_synced',
            data: syncResults
          }));
          
          // Also broadcast to all clients
          broadcastUpdate('registry_synced', syncResults);
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

  // Registry API Endpoints
  
  // Get registry categories
  app.get('/api/registry/categories', async (req: Request, res: Response) => {
    try {
      res.json(registryCategories);
    } catch (error) {
      console.error('Error getting registry categories:', error);
      res.status(500).json({ message: 'Failed to get registry categories' });
    }
  });
  
  // Search registry
  app.get('/api/registry/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.query as string | undefined;
      const category = req.query.category as string | undefined;
      const official = req.query.official === 'true';
      const sort = req.query.sort as 'popular' | 'newest' | 'name' | undefined;
      const compatibility = Array.isArray(req.query.compatibility) 
        ? req.query.compatibility as string[]
        : req.query.compatibility
          ? [req.query.compatibility as string]
          : undefined;
      
      const filtered = filterRegistryTools(
        registryTools,
        query,
        category,
        req.query.official !== undefined ? official : undefined,
        sort,
        compatibility
      );
      
      res.json(filtered);
    } catch (error) {
      console.error('Error searching registry:', error);
      res.status(500).json({ message: 'Failed to search registry' });
    }
  });
  
  // Get specific tool details
  app.get('/api/registry/tools/:id', async (req: Request, res: Response) => {
    try {
      const tool = registryTools.find(t => t.id === req.params.id);
      
      if (!tool) {
        return res.status(404).json({ message: 'Tool not found in registry' });
      }
      
      res.json(tool);
    } catch (error) {
      console.error('Error getting tool details:', error);
      res.status(500).json({ message: 'Failed to get tool details' });
    }
  });
  
  // Get featured tools
  app.get('/api/registry/featured', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      res.json(getFeaturedTools(limit));
    } catch (error) {
      console.error('Error getting featured tools:', error);
      res.status(500).json({ message: 'Failed to get featured tools' });
    }
  });
  
  // Get trending tools
  app.get('/api/registry/trending', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      res.json(getTrendingTools(limit));
    } catch (error) {
      console.error('Error getting trending tools:', error);
      res.status(500).json({ message: 'Failed to get trending tools' });
    }
  });
  
  // Check for updates
  app.get('/api/registry/updates', async (req: Request, res: Response) => {
    try {
      // In a real app, this would check for updates from the registry
      const updatesAvailable = Math.random() > 0.5; // Simulate update availability
      
      res.json({
        updatesAvailable,
        updatableTools: updatesAvailable ? Math.floor(Math.random() * 5) + 1 : 0,
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error checking for updates:', error);
      res.status(500).json({ message: 'Failed to check for updates' });
    }
  });
  
  // Install tool from registry
  app.post('/api/registry/install', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        toolId: z.string(),
        serverId: z.number().or(z.string().transform(id => parseInt(id, 10)))
      });
      
      const { toolId, serverId } = schema.parse(req.body);
      
      // Get the server
      const server = await storage.getServer(serverId);
      if (!server) {
        return res.status(404).json({ message: 'Server not found' });
      }
      
      // Find the tool in the registry
      const registryTool = registryTools.find(t => t.id === toolId);
      if (!registryTool) {
        return res.status(404).json({ message: 'Tool not found in registry' });
      }
      
      // Check compatibility
      if (registryTool.compatibleWith && !registryTool.compatibleWith.includes(server.type)) {
        return res.status(400).json({ 
          message: `Tool is not compatible with server type: ${server.type}`
        });
      }
      
      // Create the tool record in the database
      const newTool = await storage.createTool({
        name: registryTool.name,
        description: registryTool.description,
        shortDescription: registryTool.shortDescription,
        serverId: serverId,
        installed: true,
        active: false,
        categories: registryTool.categories,
        inputSchema: {
          // Create a simple schema based on the registry tool
          type: "object",
          description: `${registryTool.name} configuration`,
          properties: {
            config: {
              type: "object",
              description: "Configuration options"
            }
          },
          required: ["config"]
        }
        // createdAt and lastUsed will be set by the database defaults
      });
      
      // Create activity log
      await storage.createActivity({
        type: "success",
        message: `Installed tool ${registryTool.name} from registry`,
        serverId: serverId,
        appId: null,
        toolId: newTool.id
      });
      
      // Broadcast update to all clients
      broadcastUpdate('tool_installed', {
        tool: newTool,
        fromRegistry: registryTool.id
      });
      
      res.status(201).json(newTool);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error('Error installing tool:', error);
      res.status(500).json({ message: 'Failed to install tool' });
    }
  });
  
  // Sync registries
  app.post('/api/registry/sync', async (req: Request, res: Response) => {
    try {
      // In a real app, this would sync with external registries
      const syncResults = {
        totalSynced: registryTools.length,
        newTools: Math.floor(Math.random() * 5),
        updatedTools: Math.floor(Math.random() * 10),
        timestamp: new Date().toISOString()
      };
      
      // Create activity log
      await storage.createActivity({
        type: "info",
        message: `Synced with registry sources. Found ${syncResults.newTools} new tools.`,
        serverId: null,
        appId: null
      });
      
      // Broadcast update to all clients
      broadcastUpdate('registry_synced', syncResults);
      
      res.json(syncResults);
    } catch (error) {
      console.error('Error syncing registries:', error);
      res.status(500).json({ message: 'Failed to sync registries' });
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

  // Claude Desktop connection endpoint
  app.get('/api/connect', (req: Request, res: Response) => {
    // Extract parameters from the query
    const clientId = req.query.client_id as string || 'unknown';
    const clientVersion = req.query.version as string || 'unknown';
    
    // Log the connection attempt
    console.log(`Connection attempt from Claude Desktop: ${clientId} (v${clientVersion})`);
    
    // Create a connection activity log
    storage.createActivity({
      type: "info",
      message: `Claude Desktop connection: ${clientId} (v${clientVersion})`,
      serverId: null,
      appId: null
    }).catch(err => console.error('Failed to log connection activity:', err));
    
    // Return connection details
    res.json({
      status: 'connected',
      serverName: 'MCP Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      connectedClients: wss.clients.size,
      availableServers: storage.getServers().then(servers => servers.length).catch(() => 0),
      wsEndpoint: '/ws',
      jsonRpcEnabled: true
    });
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
