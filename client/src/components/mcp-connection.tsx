import { useEffect, useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { jsonRpcClient } from '@/lib/jsonrpc';
import { useToast } from '@/hooks/use-toast';

export function McpConnection() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const { toast } = useToast();

  // Ping the server and update connection status
  const pingServer = async () => {
    try {
      const result = await jsonRpcClient.ping();
      setStatus('connected');
      setLastPing(result.timestamp);
    } catch (error) {
      console.error('Failed to ping MCP server:', error);
      setStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to MCP server',
        variant: 'destructive'
      });
    }
  };

  // Connect to the server
  const connect = async () => {
    setStatus('connecting');
    try {
      await jsonRpcClient.connect();
      await pingServer();
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      setStatus('disconnected');
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to MCP server',
        variant: 'destructive'
      });
    }
  };

  // Attempt to reconnect if disconnected
  const reconnect = () => {
    setReconnectAttempt(prev => prev + 1);
    connect();
  };

  // Connect on component mount and setup periodic ping
  useEffect(() => {
    connect();

    // Setup periodic ping every 30 seconds
    const pingInterval = setInterval(pingServer, 30000);

    return () => {
      clearInterval(pingInterval);
      jsonRpcClient.disconnect();
    };
  }, []);

  // Render connection icon based on status
  const renderStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <ShieldCheck className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Shield className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
      default:
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
    }
  };

  // Render connection status text
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected to MCP Server';
      case 'connecting':
        return 'Connecting to MCP Server...';
      case 'disconnected':
      default:
        return 'Disconnected from MCP Server';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={reconnect}
            className="flex items-center gap-2 h-8"
          >
            {renderStatusIcon()}
            <span className="text-xs font-medium">MCP</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">{getStatusText()}</p>
            {lastPing && (
              <p className="text-xs text-muted-foreground">
                Last ping: {new Date(lastPing).toLocaleTimeString()}
              </p>
            )}
            {status === 'disconnected' && (
              <p className="text-xs text-muted-foreground">
                Click to reconnect
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}