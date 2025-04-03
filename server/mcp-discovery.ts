import fetch from 'node-fetch';
import { config } from './config';
import { storage } from './storage';
import { getSmitheryPackages } from './smithery-packages';

// Known MCP server repositories based on dcSpark/mcp-dockmaster reference
const KNOWN_REPOS = [
  { owner: 'dcSpark', repo: 'mcp-dockmaster' },
  { owner: 'Toolbase-AI', repo: 'toolbase' },
  // Add more repositories as they become available
];

// GitHub repository data interface
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  default_branch: string;
  license?: {
    key: string;
    name: string;
  };
  topics?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch repository data from GitHub
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Repository data
 */
async function fetchGitHubRepository(owner: string, repo: string): Promise<GitHubRepo> {
  const url = `${config.GITHUB_API_URL}/repos/${owner}/${repo}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (config.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${config.GITHUB_TOKEN}`;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }
  
  return await response.json() as GitHubRepo;
}

/**
 * Get server version from GitHub
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Server version
 */
async function getServerVersion(owner: string, repo: string): Promise<string> {
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

/**
 * Discover MCP servers from GitHub
 */
export async function discoverGitHubServers(): Promise<void> {
  if (!config.MCP_DISCOVERY_ENABLED) {
    console.log('MCP server discovery is disabled');
    return;
  }
  
  console.log('Discovering MCP servers from GitHub...');
  
  for (const { owner, repo } of KNOWN_REPOS) {
    try {
      const repoData = await fetchGitHubRepository(owner, repo);
      const version = await getServerVersion(owner, repo);
      
      // Check if this server already exists
      const existingServers = await storage.getServers();
      const existingServer = existingServers.find(
        server => server.repository === repoData.full_name
      );
      
      if (existingServer) {
        // Update the existing server
        await storage.updateServer(existingServer.id, {
          version,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          description: repoData.description || undefined,
        });
        
        console.log(`Updated existing server: ${repoData.full_name}`);
      } else {
        // Create a new server entry
        const newServerId = await storage.createServer({
          name: `${repoData.name} MCP Server`,
          type: 'github',
          address: repoData.html_url,
          port: findAvailablePort(),
          status: 'inactive',
          repository: repoData.full_name,
          version,
          description: repoData.description || undefined,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          owner: repoData.owner.login,
          isWorker: false,
        });
        
        console.log(`Added new server from GitHub: ${repoData.full_name}`);
      }
    } catch (error) {
      console.error(`Error processing ${owner}/${repo}:`, error);
    }
  }
}

/**
 * Find available port in the configured range
 * @returns Available port number
 */
function findAvailablePort(): number {
  const usedPorts = new Set<number>();
  
  // Get all used ports from existing servers
  storage.getServers().then(servers => {
    servers.forEach(server => {
      usedPorts.add(server.port);
    });
  });
  
  // Find the first available port in the range
  for (let port = config.MCP_PORT_RANGE_START; port <= config.MCP_PORT_RANGE_END; port++) {
    if (!usedPorts.has(port)) {
      return port;
    }
  }
  
  // If all ports are used, return the start of the range (will need conflict resolution)
  return config.MCP_PORT_RANGE_START;
}

/**
 * Discover Smithery MCP packages
 */
export async function discoverSmitheryPackages(): Promise<void> {
  if (!config.MCP_DISCOVERY_ENABLED) {
    return;
  }
  
  console.log('Discovering Smithery MCP packages...');
  
  const packages = getSmitheryPackages();
  
  for (const pkg of packages) {
    try {
      const existingServers = await storage.getServers();
      const existingServer = existingServers.find(
        server => server.smitheryPackage === pkg.id
      );
      
      if (existingServer) {
        // Update existing server
        console.log(`Smithery package ${pkg.id} already registered`);
      } else {
        // Create a new server for this package
        const newServerId = await storage.createServer({
          name: pkg.name,
          type: 'smithery',
          address: 'localhost',
          port: findAvailablePort(),
          status: 'inactive',
          smitheryPackage: pkg.id,
          apiKey: config.SMITHERY_API_KEY,
          description: pkg.description,
          isWorker: true,
          commandConfig: pkg.config,
        });
        
        console.log(`Added new server from Smithery package: ${pkg.id}`);
      }
    } catch (error) {
      console.error(`Error processing Smithery package ${pkg.id}:`, error);
    }
  }
}

/**
 * Initialize MCP server discovery
 */
export async function initializeDiscovery(): Promise<void> {
  if (config.MCP_DISCOVERY_ENABLED) {
    // Perform initial discovery
    await Promise.all([
      discoverGitHubServers(),
      discoverSmitheryPackages()
    ]);
    
    // Set up periodic discovery if worker mode is enabled
    if (config.MCP_WORKER_MODE) {
      setInterval(async () => {
        await Promise.all([
          discoverGitHubServers(),
          discoverSmitheryPackages()
        ]);
      }, config.WORKER_POLL_INTERVAL);
    }
  }
} 