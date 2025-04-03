import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
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
  // Check for URL parameters to enable headless/API-first operation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const apiKey = params.get('api_key');
    const headless = params.get('headless');
    const autoConnect = params.get('auto_connect');
    const wsUrl = params.get('ws_url');
    
    if (apiKey || headless === 'true' || autoConnect === 'true') {
      console.log('API-first/headless mode detected via URL parameters');
      
      // Update WebSocket URL if provided
      if (wsUrl) {
        jsonRpcClient.setUrl(wsUrl);
      }
      
      // Handle auto-connection for JSON-RPC if requested
      if (autoConnect === 'true') {
        try {
          // Connect using the configured WebSocket URL
          jsonRpcClient.connect().then(() => {
            console.log('Auto-connected to MCP server via JSON-RPC');
            
            // Test the connection with a ping
            jsonRpcClient.ping().then((response) => {
              console.log('MCP server ping response:', response);
            }).catch(err => {
              console.error('Failed to ping MCP server:', err);
            });
          }).catch(err => {
            console.error('Failed to auto-connect to MCP server:', err);
          });
        } catch (error) {
          console.error('Error during auto-connect setup:', error);
        }
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
