// Environment configuration for MCP Manager
import 'dotenv/config';

// Export environment variables
export const config = {
  // Smithery API key from environment variable
  SMITHERY_API_KEY: process.env.SMITHERY_API_KEY || '',
  
  // Server configuration
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // GitHub API configuration
  GITHUB_API_URL: process.env.GITHUB_API_URL || 'https://api.github.com',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  
  // Default MCP Server port range
  MCP_PORT_RANGE_START: parseInt(process.env.MCP_PORT_RANGE_START || '50050', 10),
  MCP_PORT_RANGE_END: parseInt(process.env.MCP_PORT_RANGE_END || '50150', 10),
  
  // MCP Server default settings
  MCP_SERVER_DEFAULT_MEMORY: parseInt(process.env.MCP_DEFAULT_MEMORY || '8', 10),
  
  // MCP compatibility settings
  MCP_WORKER_MODE: process.env.MCP_WORKER_MODE === 'true',
  MCP_DISCOVERY_ENABLED: process.env.MCP_DISCOVERY_ENABLED !== 'false',
  MCP_AUTOSTART_SERVERS: process.env.MCP_AUTOSTART_SERVERS !== 'false',
  
  // Worker settings
  WORKER_POLL_INTERVAL: parseInt(process.env.WORKER_POLL_INTERVAL || '30000', 10),
  MAX_CONCURRENT_WORKERS: parseInt(process.env.MAX_CONCURRENT_WORKERS || '5', 10),
  
  // Storage configuration
  USE_MEMORY_STORAGE: process.env.USE_MEMORY_STORAGE === 'true',
  
  // MCP Dockmaster compatibility
  MCP_DOCKMASTER_COMPAT: process.env.MCP_DOCKMASTER_COMPAT !== 'false',
  MCP_TEMPLATE_PATH: process.env.MCP_TEMPLATE_PATH || './templates',
  MCP_LOG_LEVEL: process.env.MCP_LOG_LEVEL || 'info',
  MCP_INSTALL_TIMEOUT: parseInt(process.env.MCP_INSTALL_TIMEOUT || '30000', 10),
  
  // WebSocket configuration
  WS_PATH: process.env.WS_PATH || '/ws',
};

// Validate required environment variables
export function validateConfig() {
  const issues = [];
  
  if (!config.SMITHERY_API_KEY) {
    issues.push('SMITHERY_API_KEY not set in environment variables. Smithery packages will not work properly.');
  }
  
  if (config.MCP_WORKER_MODE && !config.GITHUB_TOKEN) {
    issues.push('GITHUB_TOKEN not set but worker mode is enabled. GitHub repository discovery may not work properly.');
  }
  
  issues.forEach(issue => console.warn(issue));
  
  return issues.length === 0;
}