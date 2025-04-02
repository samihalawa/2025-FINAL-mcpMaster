/**
 * GitHub API utilities for MCP Manager
 * 
 * This module provides functions for fetching MCP-related repository information
 * from GitHub and other sources.
 */

import { InsertServer, Server } from '@shared/schema';
import { apiRequest } from './queryClient';

// Known MCP server repositories for auto-discovery
const KNOWN_REPOS = [
  { owner: 'dcSpark', repo: 'mcp-dockmaster' },
  { owner: 'Toolbase-AI', repo: 'toolbase' },
  // Add more repositories here as they become available
];

// GitHub API URL
const GITHUB_API_URL = 'https://api.github.com';

/**
 * Interface for GitHub repository data
 */
export interface GitHubRepo {
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
 * Fetch repository information from GitHub
 * @param owner Repository owner/organization
 * @param repo Repository name
 * @returns Repository information
 */
export async function fetchGitHubRepository(owner: string, repo: string): Promise<GitHubRepo> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data as GitHubRepo;
  } catch (error) {
    console.error(`Failed to fetch GitHub repository ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Get server version information from repository
 * @param owner Repository owner
 * @param repo Repository name
 * @returns Latest version or 'latest' if not found
 */
export async function getServerVersion(owner: string, repo: string): Promise<string> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/releases/latest`);
    if (!response.ok) {
      return 'latest'; // Default if no releases found
    }
    const data = await response.json();
    return data.tag_name || 'latest';
  } catch (error) {
    console.error(`Failed to fetch release info for ${owner}/${repo}:`, error);
    return 'latest';
  }
}

/**
 * Discover MCP servers from known GitHub repositories
 * @returns List of discovered servers
 */
export async function discoverMcpServers(): Promise<Server[]> {
  try {
    // Call the backend to handle server discovery
    const response = await apiRequest<Server[]>('POST', '/api/servers/discover');
    
    return response;
  } catch (error) {
    console.error('Failed to discover MCP servers:', error);
    throw error;
  }
}

/**
 * Create a server from GitHub repository information
 * @param owner Repository owner
 * @param repo Repository name
 * @returns The created server
 */
export async function createServerFromRepo(owner: string, repo: string): Promise<Server> {
  try {
    const repoData = await fetchGitHubRepository(owner, repo);
    const version = await getServerVersion(owner, repo);
    
    // Determine the port based on the repository (this would typically be documented)
    const port = 50050; // Default MCP port
    
    const serverData: Partial<InsertServer> = {
      name: `${repoData.name} MCP Server`,
      type: 'github',
      address: repoData.html_url,
      port,
      status: 'inactive',
      models: ['Claude-3-Opus', 'Claude-3-Sonnet', 'GPT-4'], // Default supported models
      repository: repoData.full_name,
      version,
      description: repoData.description || `MCP Server from ${repoData.full_name}`,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      owner: repoData.owner.login,
      isWorker: false,
    };
    
    // Call the backend to create the server
    const response = await apiRequest<Server>('POST', '/api/servers', serverData);
    
    return response;
  } catch (error) {
    console.error(`Failed to create server from repo ${owner}/${repo}:`, error);
    throw error;
  }
}

/**
 * Get a list of all known MCP server repositories
 */
export function getKnownRepos() {
  return KNOWN_REPOS;
}