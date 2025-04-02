/**
 * JSON-RPC Client for MCP Server
 * 
 * This module provides a client for making JSON-RPC requests to the MCP server.
 * It's designed to be compatible with the Claude Desktop and other applications
 * that use the JSON-RPC protocol.
 */

import { JsonRpcRequest, JsonRpcResponse, Server, Tool, Stats } from './types';

/**
 * JSON-RPC client for making requests to the MCP server
 */
export class JsonRpcClient {
  private ws: WebSocket | null = null;
  private url: string;
  private requestId: number = 1;
  private pendingRequests: Map<number, { 
    resolve: (value: any) => void, 
    reject: (reason: any) => void 
  }> = new Map();
  private connectionPromise: Promise<WebSocket> | null = null;
  private isConnecting: boolean = false;

  /**
   * Create a new JSON-RPC client
   * @param wsUrl The WebSocket URL to connect to
   */
  constructor(wsUrl?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = wsUrl || `${protocol}//${host}/ws`;
  }

  /**
   * Connect to the MCP server
   * @returns A promise that resolves when connected
   */
  public connect(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(this.url);

        ws.onopen = () => {
          console.log('Connected to MCP server via WebSocket');
          this.ws = ws;
          this.isConnecting = false;
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle JSON-RPC responses
            if (data.jsonrpc === '2.0' && data.id) {
              const pending = this.pendingRequests.get(data.id);
              if (pending) {
                if (data.error) {
                  pending.reject(data.error);
                } else {
                  pending.resolve(data.result);
                }
                this.pendingRequests.delete(data.id);
              }
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.ws = null;
          this.connectionPromise = null;
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from the MCP server
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connectionPromise = null;
    }
  }

  /**
   * Make a JSON-RPC request to the MCP server
   * @param method The method to call
   * @param params The parameters to pass
   * @returns A promise that resolves with the result
   */
  public async request<T>(method: string, params?: any): Promise<T> {
    const ws = await this.connect();
    
    const id = this.requestId++;
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params: params || {}
    };

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify(request));
    });
  }

  /**
   * Ping the MCP server
   * @returns A promise that resolves with the ping response
   */
  public async ping(): Promise<{ pong: boolean, timestamp: string }> {
    return this.request<{ pong: boolean, timestamp: string }>('ping');
  }

  /**
   * Get all servers
   * @returns A promise that resolves with the list of servers
   */
  public async getServers(): Promise<Server[]> {
    return this.request<Server[]>('getServers');
  }

  /**
   * Get a server by ID
   * @param id The server ID
   * @returns A promise that resolves with the server
   */
  public async getServer(id: number): Promise<Server> {
    return this.request<Server>('getServer', { id });
  }

  /**
   * Toggle a server's worker status
   * @param id The server ID
   * @returns A promise that resolves with the updated server
   */
  public async toggleWorker(id: number): Promise<Server> {
    return this.request<Server>('toggleWorker', { id });
  }

  /**
   * Get all tools
   * @returns A promise that resolves with the list of tools
   */
  public async getTools(): Promise<Tool[]> {
    return this.request<Tool[]>('getTools');
  }

  /**
   * Get tools for a server
   * @param serverId The server ID
   * @returns A promise that resolves with the list of tools
   */
  public async getToolsByServer(serverId: number): Promise<Tool[]> {
    return this.request<Tool[]>('getToolsByServer', { serverId });
  }

  /**
   * Activate a tool
   * @param id The tool ID
   * @returns A promise that resolves with the updated tool
   */
  public async activateTool(id: number): Promise<Tool> {
    return this.request<Tool>('activateTool', { id });
  }

  /**
   * Deactivate a tool
   * @param id The tool ID
   * @returns A promise that resolves with the updated tool
   */
  public async deactivateTool(id: number): Promise<Tool> {
    return this.request<Tool>('deactivateTool', { id });
  }

  /**
   * Get server statistics
   * @returns A promise that resolves with the stats
   */
  public async getStats(): Promise<Stats> {
    return this.request<Stats>('getStats');
  }
}

// Create a singleton instance for use throughout the app
export const jsonRpcClient = new JsonRpcClient();

// Export a function to create a new client with a custom URL
export function createJsonRpcClient(wsUrl: string): JsonRpcClient {
  return new JsonRpcClient(wsUrl);
}