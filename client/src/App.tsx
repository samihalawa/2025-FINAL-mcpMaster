import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { jsonRpcClient, createJsonRpcClient } from "./lib/jsonrpc";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Servers from "@/pages/servers";
import Apps from "@/pages/apps";
import Templates from "@/pages/templates";
import Settings from "@/pages/settings";
import Help from "@/pages/help";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/servers" component={Servers} />
        <Route path="/apps" component={Apps} />
        <Route path="/templates" component={Templates} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [connectedServers, setConnectedServers] = useState<string[]>([]);

  // Initialize connectivity to all available MCP servers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apiKey = params.get('api_key');
    const headless = params.get('headless');
    const autoConnect = params.get('auto_connect') !== 'false';
    const wsUrl = params.get('ws_url');
    const specificServerId = params.get('server_id');
    
    async function initializeConnections() {
      try {
        // Update WebSocket URL if provided via query param
        if (wsUrl) {
          jsonRpcClient.setUrl(wsUrl);
          console.log(`Using custom WebSocket URL: ${wsUrl}`);
        }
        
        // Connect to the main MCP Manager server first
        await jsonRpcClient.connect();
        console.log('Connected to MCP Manager server via WebSocket');
        
        // Fetch available servers
        const servers = await jsonRpcClient.getServers();
        console.log(`Found ${servers.length} MCP servers`);
        
        // If a specific server ID is requested, only connect to that one
        if (specificServerId) {
          const specificServer = servers.find(s => s.id.toString() === specificServerId);
          if (specificServer) {
            await connectToServer(specificServer.id, specificServer.address, specificServer.port);
          } else {
            console.error(`Requested server ID ${specificServerId} not found`);
          }
        } 
        // Otherwise connect to all worker servers if auto-connect is enabled
        else if (autoConnect) {
          // Connect to all worker servers
          const workerServers = servers.filter(server => server.isWorker && server.status === 'active');
          
          if (workerServers.length > 0) {
            console.log(`Connecting to ${workerServers.length} worker servers...`);
            
            await Promise.all(
              workerServers.map(server => 
                connectToServer(server.id, server.address, server.port)
              )
            );
          }
        }
        
        // Test each connection with a ping
        if (connectedServers.length > 0) {
          console.log(`Successfully connected to ${connectedServers.length} MCP servers`);
        }
      } catch (error) {
        console.error('Error initializing MCP connections:', error);
      } finally {
        setInitializing(false);
      }
    }
    
    async function connectToServer(id: number, address: string, port: number) {
      try {
        // Create a custom URL for the worker
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const serverWsUrl = `${protocol}//${address}:${port}/ws`;
        
        // Create a separate client for this server
        const serverClient = createJsonRpcClient(serverWsUrl);
        
        // Connect and ping to verify
        await serverClient.connect();
        await serverClient.ping();
        
        console.log(`Successfully connected to MCP server ${id} at ${address}:${port}`);
        setConnectedServers(prev => [...prev, `${id}`]);
        
        return true;
      } catch (error) {
        console.error(`Failed to connect to MCP server ${id} at ${address}:${port}:`, error);
        return false;
      }
    }
    
    initializeConnections();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
