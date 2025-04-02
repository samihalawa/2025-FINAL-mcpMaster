// Server types
export interface Server {
  id: number;
  name: string;
  type: string; // local, remote, docker, cloud
  address: string;
  port: number;
  status: Status;
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  models: string[];
  createdAt: string | Date;
  lastActive: string | Date;
  isWorker: boolean;
}

export interface CreateServerRequest {
  name: string;
  type: string;
  address: string;
  port: number;
  models: string[];
  isWorker?: boolean;
}

// Tool types
export interface PropertyDefinition {
  default?: any;
  description?: string;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  minimum?: number;
  maximum?: number;
  title?: string;
  type?: string | string[];
  format?: string;
  additionalProperties?: boolean;
  items?: PropertyDefinition;
  allOf?: PropertyDefinition[];
}

export interface InputSchema {
  description: string;
  properties: Record<string, PropertyDefinition>;
  required: string[];
  title?: string;
  type: string;
  additionalProperties?: boolean;
  $schema?: string;
}

export interface Tool {
  id: number;
  name: string;
  description: string;
  shortDescription: string | null;
  serverId: number;
  installed: boolean;
  active: boolean;
  categories: string[];
  inputSchema: InputSchema;
  createdAt: string | Date;
  lastUsed: string | Date | null;
}

export interface CreateToolRequest {
  name: string;
  description: string;
  shortDescription?: string;
  serverId: number;
  installed?: boolean;
  active?: boolean;
  categories?: string[];
  inputSchema: InputSchema;
}

// Registry types for tooling
export interface RegistryTool {
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
  installed?: boolean;
}

// App types
export interface App {
  id: number;
  name: string;
  type: string; // desktop, cli, web, ide
  version: string;
  serverId: number;
  status: Status;
  lastActive: string | Date;
}

// Activity types
export interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  serverId: number | null;
  appId: number | null;
  toolId?: number | null;
  createdAt: string | Date;
}

// Enums and helper types
export type Status = "active" | "inactive" | "warning" | "error";
export type ActivityType = "info" | "success" | "warning" | "error";

export interface ServerTypeOption {
  value: string;
  label: string;
}

export interface ModelOption {
  value: string;
  label: string;
}

// Statistics
export interface Stats {
  totalServers: number;
  activeServers: number;
  warningServers: number;
  connectedApps: number;
  activeTools?: number;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
}

// JSON-RPC types
export interface JsonRpcRequest {
  jsonrpc: string;
  id: number | string;
  method: string;
  params: any;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
