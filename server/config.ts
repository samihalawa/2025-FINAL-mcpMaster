// Environment configuration for MCP Manager
import 'dotenv/config';

// Export environment variables
export const config = {
  // Smithery API key from environment variable
  SMITHERY_API_KEY: process.env.SMITHERY_API_KEY || '',
  
  // Server configuration
  PORT: parseInt(process.env.PORT || '5000', 10),
  
  // GitHub API configuration
  GITHUB_API_URL: 'https://api.github.com',
  
  // Default MCP Server port range
  MCP_PORT_RANGE_START: 50050,
  MCP_PORT_RANGE_END: 50150,
};

// Validate required environment variables
export function validateConfig() {
  if (!config.SMITHERY_API_KEY) {
    console.warn('SMITHERY_API_KEY not set in environment variables. Smithery packages will not work properly.');
  }
}