/**
 * MCP Registry Manager
 * 
 * Manages the discovery, installation, and uninstallation of MCP servers and tools.
 * Compatible with the MCP Dockmaster approach.
 */

import { storage } from './storage';
import { config } from './config';
import fetch from 'node-fetch';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Registry categories
export const registryCategories = [
  'all',
  'github',
  'smithery',
  'local',
  'template',
  'installed'
];

// Known MCP server repositories
export const knownMcpRepos = [
  { owner: 'dcSpark', repo: 'mcp-dockmaster' },
  { owner: 'Toolbase-AI', repo: 'toolbase' },
  { owner: 'modelcontextprotocol', repo: 'mcp-js' },
  { owner: 'modelcontextprotocol', repo: 'mcp-python' },
  { owner: 'modelcontextprotocol', repo: 'mcp-rust' },
  { owner: 'dcSpark', repo: 'mcp-examples' },
  { owner: 'modelcontextprotocol', repo: 'mcp-spec' },
  // Template repositories
  { owner: 'dcSpark', repo: 'mcp-server-hello-world', isTemplate: true },
  { owner: 'dcSpark', repo: 'mcp-server-notes', isTemplate: true },
  { owner: 'dcSpark', repo: 'mcp-server-web-search', isTemplate: true },
  { owner: 'dcSpark', repo: 'mcp-server-file-system', isTemplate: true },
  { owner: 'dcSpark', repo: 'mcp-starter-kit', isTemplate: true }
];

// GitHub repository interface
export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  owner: {
    login: string;
    avatarUrl: string;
  };
  isTemplate?: boolean;
  cloneUrl: string;
}

// MCP Server interface
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  source: 'github' | 'smithery' | 'local' | 'template';
  url?: string;
  version?: string;
  author?: string;
  installed: boolean;
  tags?: string[];
  isTemplate?: boolean;
  cloneUrl?: string;
  installedPath?: string;
}

// Local registry data
let registry: MCPServer[] = [];

/**
 * Find an available port for a new MCP server
 * @returns Available port number
 */
export async function findAvailablePort(): Promise<number> {
  try {
    const servers = await storage.getServers();
    const usedPorts = new Set(servers.map(server => server.port));
    
    for (let port = config.MCP_PORT_RANGE_START; port <= config.MCP_PORT_RANGE_END; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }
    
    // If all ports in range are used, return the start of the range
    return config.MCP_PORT_RANGE_START;
  } catch (error) {
    console.error('Error finding available port:', error);
    return config.MCP_PORT_RANGE_START;
  }
}

/**
 * Initialize MCP discovery process
 */
export async function initializeDiscovery(): Promise<MCPServer[]> {
  try {
    console.log('Initializing MCP server discovery...');
    
    // Create templates directory if it doesn't exist
    const templatesDir = path.resolve(config.MCP_TEMPLATE_PATH);
    try {
      await fs.mkdir(templatesDir, { recursive: true });
      console.log(`Created templates directory at ${templatesDir}`);
    } catch (error) {
      console.warn(`Failed to create templates directory: ${error}`);
    }
    
    // Discover servers from different sources
    const [githubServers, smitheryPackages] = await Promise.all([
      discoverGitHubServers(),
      discoverSmitheryPackages()
    ]);
    
    // Combine results
    registry = [...githubServers, ...smitheryPackages];
    
    // Check for local installations
    await checkLocalInstallations();
    
    console.log(`MCP discovery complete. Found ${registry.length} servers in the registry.`);
    
    // Set up periodic discovery if worker mode is enabled
    if (config.MCP_WORKER_MODE) {
      setInterval(async () => {
        console.log('Running periodic MCP server discovery...');
        await Promise.all([
          discoverGitHubServers(),
          discoverSmitheryPackages()
        ]);
        await checkLocalInstallations();
      }, config.WORKER_POLL_INTERVAL);
    }
    
    return registry;
  } catch (error) {
    console.error('Error initializing MCP server discovery:', error);
    return [];
  }
}

// Check and update local installations status
async function checkLocalInstallations() {
  try {
    const templatesDir = path.resolve(config.MCP_TEMPLATE_PATH);
    const directories = await fs.readdir(templatesDir, { withFileTypes: true });
    
    for (const dir of directories.filter(dirent => dirent.isDirectory())) {
      const packageJsonPath = path.join(templatesDir, dir.name, 'package.json');
      
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        
        // Find if this installed server exists in the registry
        const existingIndex = registry.findIndex(server => 
          server.name === packageJson.name || 
          server.id === packageJson.name ||
          server.id === dir.name
        );
        
        const serverInfo: MCPServer = {
          id: packageJson.name || dir.name,
          name: packageJson.name || dir.name,
          description: packageJson.description || 'Locally installed MCP server',
          source: 'local',
          version: packageJson.version || '0.0.1',
          author: packageJson.author || 'Unknown',
          installed: true,
          tags: packageJson.keywords || [],
          installedPath: path.join(templatesDir, dir.name)
        };
        
        if (existingIndex >= 0) {
          // Update existing entry
          registry[existingIndex] = {
            ...registry[existingIndex],
            installed: true,
            installedPath: path.join(templatesDir, dir.name)
          };
        } else {
          // Add new local entry
          registry.push(serverInfo);
        }
        
        // Also register with storage if MCP_DOCKMASTER_COMPAT is enabled
        if (config.MCP_DOCKMASTER_COMPAT) {
          try {
            const existingServers = await storage.getServers();
            const existingServer = existingServers.find(
              server => server.name === packageJson.name
            );
            
            if (!existingServer) {
              // Add to storage
              await storage.createServer({
                name: packageJson.name,
                type: 'local',
                address: 'localhost',
                port: await findAvailablePort(),
                status: 'active',
                version: packageJson.version || '0.0.1',
                description: packageJson.description,
                isWorker: true
              });
            }
          } catch (err) {
            console.warn(`Error registering server with storage: ${err}`);
          }
        }
      } catch (error) {
        console.warn(`Error reading package.json for ${dir.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error checking local installations:', error);
  }
}

/**
 * Discover MCP servers from GitHub repositories
 */
export async function discoverGitHubServers(): Promise<MCPServer[]> {
  if (!config.MCP_DISCOVERY_ENABLED) {
    console.log('GitHub MCP server discovery disabled.');
    return [];
  }
  
  try {
    console.log('Discovering MCP servers from GitHub repositories...');
    const servers: MCPServer[] = [];
    
    // Process known MCP server repositories
    for (const repo of knownMcpRepos) {
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
        };
        
        if (config.GITHUB_TOKEN) {
          headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
        }
        
        const response = await axios.get(
          `${config.GITHUB_API_URL}/repos/${repo.owner}/${repo.repo}`,
          { headers }
        );
        
        const repoData = response.data;
        
        const server: MCPServer = {
          id: `github-${repo.owner}-${repo.repo}`,
          name: repoData.name,
          description: repoData.description || `MCP server from ${repoData.full_name}`,
          source: repo.isTemplate ? 'template' : 'github',
          url: repoData.html_url,
          author: repoData.owner.login,
          installed: false,
          tags: repoData.topics || [],
          isTemplate: !!repo.isTemplate,
          cloneUrl: repoData.clone_url
        };
        
        servers.push(server);
        
        // Also add to storage if MCP_DOCKMASTER_COMPAT is enabled
        if (config.MCP_DOCKMASTER_COMPAT) {
          try {
            const existingServers = await storage.getServers();
            const existingServer = existingServers.find(
              s => s.repository === `${repo.owner}/${repo.repo}`
            );
            
            if (!existingServer) {
              await storage.createServer({
                name: repoData.name,
                type: 'github',
                address: repoData.html_url,
                port: await findAvailablePort(),
                status: 'inactive',
                repository: repoData.full_name,
                version: await getRepoVersion(repo.owner, repo.repo),
                description: repoData.description,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                owner: repoData.owner.login,
                isWorker: false
              });
            }
          } catch (err) {
            console.warn(`Error registering server with storage: ${err}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching repo ${repo.owner}/${repo.repo}:`, error);
      }
    }
    
    console.log(`Discovered ${servers.length} MCP servers from GitHub.`);
    return servers;
  } catch (error) {
    console.error('Error discovering GitHub MCP servers:', error);
    return [];
  }
}

/**
 * Discover MCP servers from Smithery packages
 */
export async function discoverSmitheryPackages(): Promise<MCPServer[]> {
  if (!config.SMITHERY_API_KEY || !config.MCP_DISCOVERY_ENABLED) {
    console.log('Smithery MCP package discovery disabled or missing API key.');
    return [];
  }
  
  try {
    console.log('Discovering MCP servers from Smithery packages...');
    
    // Mock implementation for now - would need real Smithery API integration
    const mockPackages: MCPServer[] = [
      {
        id: 'smithery-mcp-worker',
        name: 'MCP Worker',
        description: 'Simple MCP worker for processing jobs',
        source: 'smithery',
        version: '1.0.0',
        author: 'Smithery',
        installed: false,
        tags: ['worker', 'basic']
      },
      {
        id: 'smithery-mcp-advanced',
        name: 'MCP Advanced Server',
        description: 'Advanced MCP server with additional features',
        source: 'smithery',
        version: '1.2.0',
        author: 'Smithery',
        installed: false,
        tags: ['advanced', 'enterprise']
      }
    ];
    
    console.log(`Discovered ${mockPackages.length} MCP servers from Smithery.`);
    return mockPackages;
  } catch (error) {
    console.error('Error discovering Smithery MCP packages:', error);
    return [];
  }
}

/**
 * Search the registry for servers
 * @param query Search query
 * @param category Category filter
 * @returns Matching servers
 */
export function searchRegistry(
  query: string = '',
  category: string = 'all'
): MCPServer[] {
  // Filter by category first
  let results = registry;
  
  if (category !== 'all') {
    if (category === 'installed') {
      results = registry.filter(server => server.installed);
    } else {
      results = registry.filter(server => server.source === category);
    }
  }
  
  // Then filter by search query if provided
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(server => 
      server.name.toLowerCase().includes(lowerQuery) ||
      server.description.toLowerCase().includes(lowerQuery) ||
      (server.tags && server.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }
  
  return results;
}

/**
 * Install an MCP server from the registry
 * @param serverId Server ID to install
 * @returns Updated server information
 */
export async function installServer(serverId: string): Promise<MCPServer> {
  const server = registry.find(s => s.id === serverId);
  
  if (!server) {
    throw new Error(`Server with ID ${serverId} not found in the registry`);
  }
  
  console.log(`Installing MCP server: ${server.name} (${server.id})`);
  
  try {
    const templatesDir = path.resolve(config.MCP_TEMPLATE_PATH);
    const installDir = path.join(templatesDir, server.id);
    
    // Create directory if it doesn't exist
    await fs.mkdir(installDir, { recursive: true });
    
    let success = false;
    
    if (server.source === 'github' || server.source === 'template') {
      if (!server.cloneUrl) {
        throw new Error('GitHub clone URL not available');
      }
      
      // Clone the repository
      console.log(`Cloning from ${server.cloneUrl} to ${installDir}`);
      
      try {
        await execAsync(`git clone ${server.cloneUrl} "${installDir}"`, {
          timeout: config.MCP_INSTALL_TIMEOUT
        });
        
        // Install dependencies if package.json exists
        const packageJsonPath = path.join(installDir, 'package.json');
        try {
          await fs.access(packageJsonPath);
          console.log(`Installing dependencies for ${server.name}`);
          await execAsync(`cd "${installDir}" && npm install`, {
            timeout: config.MCP_INSTALL_TIMEOUT
          });
        } catch (err) {
          console.log(`No package.json found for ${server.name}, skipping npm install`);
        }
        
        success = true;
      } catch (error) {
        throw new Error(`Failed to clone or install: ${error}`);
      }
    } else if (server.source === 'smithery') {
      // Mock Smithery package installation for now
      await fs.writeFile(
        path.join(installDir, 'package.json'),
        JSON.stringify({
          name: server.name,
          version: server.version || '1.0.0',
          description: server.description,
          author: server.author || 'Smithery',
          main: 'index.js'
        }, null, 2)
      );
      
      await fs.writeFile(
        path.join(installDir, 'index.js'),
        `console.log('MCP Server: ${server.name}');\n`
      );
      
      success = true;
    } else {
      throw new Error(`Unsupported server source: ${server.source}`);
    }
    
    if (success) {
      // Update server in registry
      const updatedServer = {
        ...server,
        installed: true,
        installedPath: installDir
      };
      
      // Update registry
      const index = registry.findIndex(s => s.id === serverId);
      if (index >= 0) {
        registry[index] = updatedServer;
      }
      
      // Also update storage if MCP_DOCKMASTER_COMPAT is enabled
      if (config.MCP_DOCKMASTER_COMPAT) {
        try {
          const servers = await storage.getServers();
          const storageServer = servers.find(
            s => s.name === server.name || 
                (s.repository && `github-${s.repository.replace('/', '-')}` === serverId)
          );
          
          if (storageServer) {
            await storage.updateServer(storageServer.id, {
              status: 'active',
              isWorker: true
            });
            
            await storage.createActivity({
              type: 'success',
              message: `Successfully installed server: ${server.name}`,
              serverId: storageServer.id
            });
          }
        } catch (err) {
          console.warn(`Error updating server in storage: ${err}`);
        }
      }
      
      console.log(`Successfully installed server: ${server.name}`);
      return updatedServer;
    } else {
      throw new Error('Installation failed');
    }
  } catch (error) {
    console.error(`Error installing server ${server.name}:`, error);
    throw error;
  }
}

/**
 * Uninstall an MCP server
 * @param serverId Server ID to uninstall
 * @returns Success status
 */
export async function uninstallServer(serverId: string): Promise<boolean> {
  const server = registry.find(s => s.id === serverId);
  
  if (!server) {
    throw new Error(`Server with ID ${serverId} not found in the registry`);
  }
  
  if (!server.installed || !server.installedPath) {
    throw new Error(`Server ${server.name} is not installed`);
  }
  
  console.log(`Uninstalling MCP server: ${server.name} (${server.id})`);
  
  try {
    // Delete the server directory
    await fs.rm(server.installedPath, { recursive: true, force: true });
    
    // Update server in registry
    const index = registry.findIndex(s => s.id === serverId);
    if (index >= 0) {
      registry[index] = {
        ...registry[index],
        installed: false,
        installedPath: undefined
      };
    }
    
    // Also update storage if MCP_DOCKMASTER_COMPAT is enabled
    if (config.MCP_DOCKMASTER_COMPAT) {
      try {
        const servers = await storage.getServers();
        const storageServer = servers.find(
          s => s.name === server.name || 
              (s.repository && `github-${s.repository.replace('/', '-')}` === serverId)
        );
        
        if (storageServer) {
          await storage.updateServer(storageServer.id, {
            status: 'inactive',
            isWorker: false
          });
          
          await storage.createActivity({
            type: 'info',
            message: `Successfully uninstalled server: ${server.name}`,
            serverId: storageServer.id
          });
        }
      } catch (err) {
        console.warn(`Error updating server in storage: ${err}`);
      }
    }
    
    console.log(`Successfully uninstalled server: ${server.name}`);
    return true;
  } catch (error) {
    console.error(`Error uninstalling server ${server.name}:`, error);
    throw error;
  }
}

/**
 * Start a server 
 * @param serverId Server ID to start
 * @returns Success status
 */
export async function startServer(serverId: string): Promise<boolean> {
  const server = registry.find(s => s.id === serverId);
  
  if (!server) {
    throw new Error(`Server with ID ${serverId} not found in the registry`);
  }
  
  if (!server.installed || !server.installedPath) {
    throw new Error(`Server ${server.name} is not installed`);
  }
  
  console.log(`Starting MCP server: ${server.name} (${server.id})`);
  // Implementation would start the server as a child process or similar
  
  return true;
}

/**
 * Stop a server
 * @param serverId Server ID to stop
 * @returns Success status
 */
export async function stopServer(serverId: string): Promise<boolean> {
  const server = registry.find(s => s.id === serverId);
  
  if (!server) {
    throw new Error(`Server with ID ${serverId} not found in the registry`);
  }
  
  console.log(`Stopping MCP server: ${server.name} (${server.id})`);
  // Implementation would stop the running server process
  
  return true;
}

/**
 * Get server status
 * @param serverId Server ID
 * @returns Server status
 */
export async function getServerStatus(serverId: string): Promise<string> {
  const server = registry.find(s => s.id === serverId);
  
  if (!server) {
    throw new Error(`Server with ID ${serverId} not found in the registry`);
  }
  
  return server.installed ? 'installed' : 'available';
}

/**
 * Get latest version of repository from GitHub releases
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Latest version
 */
async function getRepoVersion(owner: string, repo: string): Promise<string> {
  try {
    const releaseUrl = `${config.GITHUB_API_URL}/repos/${owner}/${repo}/releases/latest`;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (config.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(releaseUrl, { headers });
    
    if (!response.ok) {
      return 'unknown';
    }
    
    const releaseData = await response.json() as { tag_name?: string };
    return releaseData.tag_name || 'unknown';
  } catch (error) {
    console.error('Error fetching server version:', error);
    return 'unknown';
  }
} 