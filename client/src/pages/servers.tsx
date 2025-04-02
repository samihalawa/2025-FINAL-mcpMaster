import { useServers } from "@/hooks/use-servers";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play,
  Square,
  RefreshCw,
  Settings,
  Trash,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle
} from "lucide-react";
import AddServerModal from "@/components/servers/AddServerModal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useStartServer, useStopServer, useRestartServer, useDeleteServer } from "@/hooks/use-servers";

export default function ServersPage() {
  const { data: servers, isLoading } = useServers();
  const { mutate: startServer } = useStartServer();
  const { mutate: stopServer } = useStopServer();
  const { mutate: restartServer } = useRestartServer();
  const { mutate: deleteServer } = useDeleteServer();

  const handleStart = (id: number, name: string) => {
    startServer(id, {
      onSuccess: () => {
        toast({
          title: "Server started",
          description: `${name} started successfully`
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

  const handleStop = (id: number, name: string) => {
    stopServer(id, {
      onSuccess: () => {
        toast({
          title: "Server stopped",
          description: `${name} stopped successfully`
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

  const handleRestart = (id: number, name: string) => {
    restartServer(id, {
      onSuccess: () => {
        toast({
          title: "Server restarted",
          description: `${name} restarted successfully`
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

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteServer(id, {
        onSuccess: () => {
          toast({
            title: "Server deleted",
            description: `${name} has been deleted`
          });
        },
        onError: () => {
          toast({
            title: "Delete failed",
            description: "Could not delete the server",
            variant: "destructive"
          });
        }
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number, lastActive: string, status: string) => {
    if (status === "inactive") {
      return `Last active: ${formatDistanceToNow(new Date(lastActive), { addSuffix: true })}`;
    }
    
    if (uptime === 0) return "Just started";
    
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    return hours > 0 
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">MCP Servers</h1>
          <AddServerModal />
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <Table>
            <TableCaption>List of managed MCP servers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Connected Apps</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading servers...
                  </TableCell>
                </TableRow>
              ) : servers?.length > 0 ? (
                servers.map((server: any) => (
                  <TableRow key={server.id}>
                    <TableCell className="font-medium">{server.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(server.status)}
                        <span className="ml-2">
                          {server.status === "active" ? "Running" : 
                           server.status === "warning" ? "Update Available" : 
                           server.status === "error" ? "Error" : "Stopped"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {server.model}
                      </Badge>
                    </TableCell>
                    <TableCell>{server.port}</TableCell>
                    <TableCell>
                      {formatUptime(server.uptime, server.lastActive, server.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {server.connectedApps.length > 0 ? (
                          server.connectedApps.map((app: string) => (
                            <Badge key={app} variant="outline" className="font-normal">
                              {app}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {server.status === "active" ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRestart(server.id, server.name)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStop(server.id, server.name)}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            onClick={() => handleStart(server.id, server.name)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          onClick={() => handleDelete(server.id, server.name)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">
                      No servers found. Add a server to get started.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
