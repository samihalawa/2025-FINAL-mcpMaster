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
  
  // Close existing connection if present
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connection established');
    
    // Send a ping to verify connection
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ command: 'ping', timestamp: new Date().toISOString() }));
    }
  };
  
  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleWebSocketMessage(message);
      
      // Log connection confirmation
      if (message.type === 'connection_established') {
        console.log('Server confirmed WebSocket connection at:', message.data.timestamp);
      }
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
  // Try WebSocket if available, fall back to HTTP API
  if (ws && ws.readyState === WebSocket.OPEN) {
    return new Promise((resolve, reject) => {
      // Create a unique ID for this request
      const requestId = `sync_${Date.now()}`;
      
      // Set up a one-time message handler to catch the response
      const messageHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.type === 'sync_completed') {
            // Remove the message listener to avoid memory leaks
            ws?.removeEventListener('message', messageHandler);
            resolve(response.data);
          } else if (response.type === 'error' && response.data.command === 'sync_servers') {
            // Remove the message listener to avoid memory leaks
            ws?.removeEventListener('message', messageHandler);
            reject(new Error(response.data.message));
          }
        } catch (error) {
          console.error('Error parsing WebSocket response:', error);
        }
      };
      
      // Add the temporary message handler
      if (ws) {
        ws.addEventListener('message', messageHandler);
        
        // Send the command
        ws.send(JSON.stringify({
          command: 'sync_servers',
          requestId
        }));
      }
      
      // Set a timeout to clean up the handler and reject the promise if no response
      setTimeout(() => {
        ws?.removeEventListener('message', messageHandler);
        reject(new Error('WebSocket sync operation timed out'));
      }, 10000);
    });
  } else {
    // Fall back to HTTP API
    return apiRequest('POST', '/api/sync');
  }
}

export async function toggleWorkerMode(serverId: number) {
  // Try WebSocket if available, fall back to HTTP API
  if (ws && ws.readyState === WebSocket.OPEN) {
    return new Promise((resolve, reject) => {
      // Create a unique ID for this request
      const requestId = `toggle_worker_${Date.now()}`;
      
      // Set up a one-time message handler to catch the response
      const messageHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.type === 'server_updated' && response.data.id === serverId) {
            // Remove the message listener to avoid memory leaks
            ws?.removeEventListener('message', messageHandler);
            resolve(response.data);
          } else if (response.type === 'error' && response.data.command === 'toggle_worker') {
            // Remove the message listener to avoid memory leaks
            ws?.removeEventListener('message', messageHandler);
            reject(new Error(response.data.message));
          }
        } catch (error) {
          console.error('Error parsing WebSocket response:', error);
        }
      };
      
      // Add the temporary message handler
      if (ws) {
        ws.addEventListener('message', messageHandler);
        
        // Send the command
        ws.send(JSON.stringify({
          command: 'toggle_worker',
          serverId,
          requestId
        }));
      }
      
      // Set a timeout to clean up the handler and reject the promise if no response
      setTimeout(() => {
        ws?.removeEventListener('message', messageHandler);
        reject(new Error('WebSocket toggle worker operation timed out'));
      }, 10000);
    });
  } else {
    // Fall back to HTTP API
    return apiRequest('POST', `/api/servers/${serverId}/toggle-worker`);
  }
}

// Headless API operations
export async function performHeadlessOperation(action: string, id?: number, params?: any) {
  const queryParams = new URLSearchParams();
  queryParams.append('action', action);
  
  if (id !== undefined) {
    queryParams.append('id', id.toString());
  }
  
  if (params) {
    queryParams.append('params', JSON.stringify(params));
  }
  
  const url = `/api/headless/operation?${queryParams.toString()}`;
  return apiRequest('GET', url);
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
