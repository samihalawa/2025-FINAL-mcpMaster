import { config } from './config';

// Smithery MCP server packages
export interface SmitheryPackage {
  id: string;
  name: string;
  description: string;
  package: string;
  apiKeyRequired: boolean;
  config: Record<string, any>;
}

export function getSmitheryPackages(): SmitheryPackage[] {
  return [
    { 
      id: 'server-sequential-thinking',
      name: 'Sequential Thinking',
      description: 'A Smithery MCP server for sequential reasoning',
      package: '@smithery-ai/server-sequential-thinking',
      apiKeyRequired: true,
      config: {
        mcpServers: {
          "server-sequential-thinking": {
            "command": "npx",
            "args": [
              "-y",
              "@smithery/cli@latest",
              "run",
              "@smithery-ai/server-sequential-thinking",
              "--key",
              config.SMITHERY_API_KEY
            ]
          }
        }
      }
    },
    {
      id: 'desktop-commander',
      name: 'Desktop Commander',
      description: 'A Smithery MCP server for desktop automation',
      package: '@wonderwhy-er/desktop-commander',
      apiKeyRequired: true,
      config: {
        mcpServers: {
          "desktop-commander": {
            "command": "npx",
            "args": [
              "-y",
              "@smithery/cli@latest",
              "run",
              "@wonderwhy-er/desktop-commander",
              "--key",
              config.SMITHERY_API_KEY
            ]
          }
        }
      }
    },
    {
      id: 'think-mcp-server',
      name: 'Think MCP Server',
      description: 'A minimal MCP server for autonomous agents',
      package: '@PhillipRt/think-mcp-server',
      apiKeyRequired: true,
      config: {
        mcpServers: {
          "think-mcp-server": {
            "command": "npx",
            "args": [
              "-y",
              "@smithery/cli@latest",
              "run",
              "@PhillipRt/think-mcp-server",
              "--key",
              config.SMITHERY_API_KEY
            ]
          }
        }
      }
    }
  ];
} 