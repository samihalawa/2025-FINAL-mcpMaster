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
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
}
