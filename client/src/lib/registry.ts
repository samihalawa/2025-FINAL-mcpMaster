/**
 * MCP Registry Service
 * 
 * This module provides functions for interacting with MCP registries
 * to discover, search and install MCP tools and servers.
 */

import { apiRequest } from "./queryClient";
import { RegistryTool, RegistryCategory, RegistrySearchParams } from "./types";

// Default registry sources
const DEFAULT_REGISTRIES = [
  {
    id: "official",
    name: "Official MCP Registry",
    url: "/api/registry/official"
  },
  {
    id: "github",
    name: "GitHub MCP Projects",
    url: "/api/registry/github"
  },
  {
    id: "community",
    name: "Community Contributions",
    url: "/api/registry/community"
  }
];

/**
 * Search for tools in the registry
 */
export async function searchRegistry(params: RegistrySearchParams = {}): Promise<RegistryTool[]> {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.append('query', params.query);
  if (params.category) searchParams.append('category', params.category);
  if (params.official !== undefined) searchParams.append('official', params.official.toString());
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.compatibility && params.compatibility.length > 0) {
    params.compatibility.forEach(compat => {
      searchParams.append('compatibility', compat);
    });
  }
  
  const url = `/api/registry/search?${searchParams.toString()}`;
  const response = await apiRequest<RegistryTool[]>('GET', url);
  return response;
}

/**
 * Get categories from the registry
 */
export async function getCategories(): Promise<RegistryCategory[]> {
  const response = await apiRequest<RegistryCategory[]>('GET', '/api/registry/categories');
  return response;
}

/**
 * Get details for a specific tool
 */
export async function getToolDetails(id: string): Promise<RegistryTool> {
  const response = await apiRequest<RegistryTool>('GET', `/api/registry/tools/${id}`);
  return response;
}

/**
 * Install a tool from the registry
 */
export async function installTool(toolId: string, serverId: number): Promise<any> {
  const response = await apiRequest<any>('POST', `/api/registry/install`, {
    toolId,
    serverId
  });
  return response;
}

/**
 * Get featured tools
 */
export async function getFeaturedTools(): Promise<RegistryTool[]> {
  const response = await apiRequest<RegistryTool[]>('GET', '/api/registry/featured');
  return response;
}

/**
 * Get trending tools
 */
export async function getTrendingTools(): Promise<RegistryTool[]> {
  const response = await apiRequest<RegistryTool[]>('GET', '/api/registry/trending');
  return response;
}

/**
 * Check for updates to installed tools
 */
export async function checkForUpdates(): Promise<any> {
  const response = await apiRequest<any>('GET', '/api/registry/updates');
  return response;
}

/**
 * Sync with registries to update available tools
 */
export async function syncRegistries(): Promise<any> {
  const response = await apiRequest<any>('POST', '/api/registry/sync');
  return response;
}