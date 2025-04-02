import { queryClient } from "./queryClient";
import { WebSocketMessage } from "./types";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

// Server types and model options
export const SERVER_TYPES = [
  { value: "local", label: "Local Server" },
  { value: "remote", label: "Remote Server" },
  { value: "docker", label: "Docker Container" },
  { value: "cloud", label: "Cloud Instance" }
];

export const MODEL_OPTIONS = [
  { value: "Claude-3-Opus", label: "Claude-3-Opus" },
  { value: "Claude-3-Sonnet", label: "Claude-3-Sonnet" },
  { value: "Claude-3-Haiku", label: "Claude-3-Haiku" },
  { value: "GPT-4", label: "GPT-4" },
  { value: "GPT-3.5-Turbo", label: "GPT-3.5-Turbo" },
  { value: "Llama-3", label: "Llama-3" }
];

// WebSocket connection
let ws: WebSocket | null = null;

export function setupWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
  };
  
  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleWebSocketMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  ws.onclose = () => {
    console.log('WebSocket connection closed');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      setupWebSocket();
    }, 5000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function handleWebSocketMessage(message: WebSocketMessage) {
  console.log('Received WebSocket message:', message);
  
  switch (message.type) {
    case 'server_created':
    case 'server_updated':
    case 'server_deleted':
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      break;
      
    case 'app_created':
    case 'app_updated':
    case 'app_deleted':
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      break;
      
    case 'activity_created':
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      break;
      
    case 'sync_completed':
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/apps'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      break;
  }
}

// Server API functions
export async function syncAllServers() {
  return apiRequest('POST', '/api/sync');
}

export async function toggleWorkerMode(serverId: number) {
  return apiRequest('POST', `/api/servers/${serverId}/toggle-worker`);
}

// Format functions
export function formatAddress(server: { address: string, port: number }): string {
  return `${server.address}:${server.port}`;
}

// Helper for relative time (e.g., "2 hours ago")
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  }
}

// Activity icon mapping
export function getActivityIcon(type: string) {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'alert-triangle';
    case 'error':
      return 'x-circle';
    case 'info':
    default:
      return 'info';
  }
}

// Status color mapping
export function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-amber-100 text-amber-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'inactive':
    default:
      return 'bg-neutral-100 text-neutral-800';
  }
}
