import { SERVER_STATUS } from "@shared/schema";

// MCP server platform capabilities
export interface Platform {
  name: string;
  icon: string;
  supportedModels: string[];
}

// Available platforms
export const platforms: Platform[] = [
  {
    name: "Claude Desktop",
    icon: "laptop",
    supportedModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-3.5-sonnet"]
  },
  {
    name: "Cursor",
    icon: "code",
    supportedModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-3.5-sonnet"]
  },
  {
    name: "Cline",
    icon: "terminal",
    supportedModels: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku", "claude-3.5-sonnet"]
  }
];

// Helper function to format memory size in a human-readable format
export function formatMemorySize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper function to format uptime in a human-readable format
export function formatUptime(seconds: number): string {
  if (seconds === 0) return "0s";
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 && parts.length === 0) parts.push(`${remainingSeconds}s`);
  
  return parts.join(" ");
}

// Helper function to get styling for server status
export function getServerStatusStyles(status: string): { 
  bgColor: string; 
  textColor: string;
  dotColor: string;
  label: string;
} {
  switch (status) {
    case SERVER_STATUS.ACTIVE:
      return {
        bgColor: "bg-green-100 dark:bg-green-900",
        textColor: "text-green-600 dark:text-green-400",
        dotColor: "bg-green-500",
        label: "Active"
      };
    case SERVER_STATUS.WARNING:
      return {
        bgColor: "bg-yellow-100 dark:bg-yellow-900",
        textColor: "text-yellow-600 dark:text-yellow-400",
        dotColor: "bg-yellow-500",
        label: "Warning"
      };
    case SERVER_STATUS.ERROR:
      return {
        bgColor: "bg-red-100 dark:bg-red-900",
        textColor: "text-red-600 dark:text-red-400",
        dotColor: "bg-red-500",
        label: "Error"
      };
    case SERVER_STATUS.INACTIVE:
    default:
      return {
        bgColor: "bg-gray-100 dark:bg-gray-700",
        textColor: "text-gray-600 dark:text-gray-400",
        dotColor: "bg-gray-500",
        label: "Inactive"
      };
  }
}

// Helper function to find available port
export async function findAvailablePort(startPort: number = 11434): Promise<number> {
  // In a real implementation, this would check if the port is in use
  // For this mock implementation, just return the suggested port
  return startPort;
}

// Helper function to determine if a port is in use
export async function isPortInUse(port: number): Promise<boolean> {
  // In a real implementation, this would check if the port is in use
  // For this mock implementation, return false
  return false;
}
