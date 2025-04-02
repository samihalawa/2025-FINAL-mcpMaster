import { Server } from "@shared/schema";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Server as ServerIcon,
  Play,
  Square,
  Terminal,
  Settings,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUpdateServer, useStartServer, useStopServer, useRestartServer } from "@/hooks/use-servers";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ServerCardProps {
  server: Server;
}

export default function ServerCard({ server }: ServerCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { mutate: updateServer } = useUpdateServer();
  const { mutate: startServer, isPending: isStarting } = useStartServer();
  const { mutate: stopServer, isPending: isStopping } = useStopServer();
  const { mutate: restartServer, isPending: isRestarting } = useRestartServer();

  const handleAutoStartToggle = (autoStart: boolean) => {
    updateServer(
      { 
        id: server.id, 
        server: { autoStart } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Auto-start updated",
            description: `${server.name} auto-start ${autoStart ? 'enabled' : 'disabled'}`
          });
        },
        onError: () => {
          toast({
            title: "Update failed",
            description: "Could not update auto-start setting",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleStart = () => {
    startServer(server.id, {
      onSuccess: () => {
        toast({
          title: "Server started",
          description: `${server.name} started successfully`
        });
      },
      onError: () => {
        toast({
          title: "Start failed",
          description: "Could not start the server",
          variant: "destructive"
        });
      }
    });
  };

  const handleStop = () => {
    stopServer(server.id, {
      onSuccess: () => {
        toast({
          title: "Server stopped",
          description: `${server.name} stopped successfully`
        });
      },
      onError: () => {
        toast({
          title: "Stop failed",
          description: "Could not stop the server",
          variant: "destructive"
        });
      }
    });
  };

  const handleRestart = () => {
    restartServer(server.id, {
      onSuccess: () => {
        toast({
          title: "Server restarted",
          description: `${server.name} restarted successfully`
        });
      },
      onError: () => {
        toast({
          title: "Restart failed",
          description: "Could not restart the server",
          variant: "destructive"
        });
      }
    });
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    // Simulate update process
    setTimeout(() => {
      updateServer(
        { 
          id: server.id, 
          server: { 
            status: "active",
            model: "claude-3.5-sonnet" 
          } 
        },
        {
          onSuccess: () => {
            toast({
              title: "Update completed",
              description: `${server.name} updated to Claude 3.5 Sonnet`
            });
            setIsUpdating(false);
          },
          onError: () => {
            toast({
              title: "Update failed",
              description: "Could not update the server",
              variant: "destructive"
            });
            setIsUpdating(false);
          }
        }
      );
    }, 1500);
  };

  // Helper function to get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          bgColor: "bg-green-100 dark:bg-green-900",
          textColor: "text-green-600 dark:text-green-400",
          dotColor: "bg-green-500",
          label: "Active"
        };
      case "warning":
        return {
          bgColor: "bg-yellow-100 dark:bg-yellow-900",
          textColor: "text-yellow-600 dark:text-yellow-400",
          dotColor: "bg-yellow-500",
          label: "Update Available"
        };
      case "error":
        return {
          bgColor: "bg-red-100 dark:bg-red-900",
          textColor: "text-red-600 dark:text-red-400",
          dotColor: "bg-red-500",
          label: "Error"
        };
      default:
        return {
          bgColor: "bg-gray-100 dark:bg-gray-700",
          textColor: "text-gray-600 dark:text-gray-400",
          dotColor: "bg-gray-500",
          label: "Inactive"
        };
    }
  };

  const statusInfo = getStatusInfo(server.status);

  // Format memory to MB or GB
  const formatMemory = (memory: number) => {
    if (memory === 0) return "0 MB";
    return memory >= 1000
      ? `${(memory / 1000).toFixed(1)} GB`
      : `${memory} MB`;
  };

  // Format uptime (seconds) to human-readable format
  const formatUptime = (uptime: number) => {
    if (uptime === 0) {
      return server.status === "inactive" 
        ? formatDistanceToNow(new Date(server.lastActive), { addSuffix: true })
        : "0m";
    }
    
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;
  };

  return (
    <Card className="mb-4 overflow-hidden shadow">
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          {/* Header section with server info and action button */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full ${statusInfo.bgColor} flex items-center justify-center`}>
                  <ServerIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{server.name}</h3>
                  <div className="flex items-center mt-1">
                    <span className={`flex-shrink-0 inline-block h-2 w-2 rounded-full ${statusInfo.dotColor} mr-2`}></span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{statusInfo.label}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              <div className="inline-flex mr-2">
                <Badge
                  variant="outline"
                  className={`px-2 text-xs font-semibold ${
                    server.status === "warning"
                      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                      : server.status === "active"
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {server.model}
                </Badge>
              </div>
              {server.status === "warning" ? (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              ) : server.status === "inactive" ? (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={handleStart}
                  disabled={isStarting}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {}}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              )}
            </div>
          </div>
          
          {/* Server metrics */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Port</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{server.port}</div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU Usage</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{server.cpuUsage}%</div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Memory</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{formatMemory(server.memory)}</div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {server.status === "active" ? "Uptime" : "Last Active"}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{formatUptime(server.uptime)}</div>
            </div>
          </div>
          
          {/* Connected applications */}
          <div className="mt-4">
            <div className="flex items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                {server.status === "active" ? "Connected to:" : "Available for:"}
              </div>
              <div className="flex flex-wrap gap-2">
                {server.connectedApps.map((app) => {
                  // Determine badge color by app name
                  let badgeClass = "";
                  let icon = null;
                  
                  if (app.includes("Claude")) {
                    badgeClass = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
                    icon = <Terminal className="h-3 w-3 mr-1" />;
                  } else if (app.includes("Cursor")) {
                    badgeClass = "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
                    icon = <Terminal className="h-3 w-3 mr-1" />;
                  } else {
                    badgeClass = "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
                    icon = <Terminal className="h-3 w-3 mr-1" />;
                  }
                  
                  return (
                    <Badge
                      key={app}
                      variant="outline"
                      className={`px-2.5 py-0.5 ${badgeClass} flex items-center`}
                    >
                      {icon}
                      {app}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {server.status === "active" ? (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleRestart}
                    disabled={isRestarting}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Restart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStop}
                    disabled={isStopping}
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Terminal className="h-3 w-3 mr-1" />
                    Console
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={handleStart}
                    disabled={isStarting}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={true}
                  >
                    <Square className="h-3 w-3 mr-1" />
                    Stop
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                </>
              )}
            </div>
            
            {/* Auto-start toggle */}
            <div className="inline-flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Auto-start</span>
              <Switch 
                checked={server.autoStart}
                onCheckedChange={handleAutoStartToggle}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
