import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Server, Settings, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Server as ServerType } from "@/lib/types";
import { formatAddress, getStatusColor } from "@/lib/mcp";

interface ServerCardProps {
  server: ServerType;
}

export default function ServerCard({ server }: ServerCardProps) {
  // Function to get icon based on server type
  const getServerIcon = () => {
    // Default to the server icon
    return <Server className="h-6 w-6" />;
  };
  
  // Get color for the progress bar based on usage level
  const getUsageColor = (usage: number) => {
    if (usage > 80) return "bg-red-600";
    if (usage > 60) return "bg-amber-500";
    return "bg-primary-600";
  };
  
  // Calculate memory usage as percentage
  const memoryPercentage = (server.memoryUsage / server.totalMemory) * 100;
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-primary-100 text-primary-600">
              {getServerIcon()}
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-neutral-900">{server.name}</h3>
              <p className="text-xs text-neutral-500">{formatAddress(server)}</p>
            </div>
          </div>
          <Badge className={getStatusColor(server.status)}>
            {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
          </Badge>
        </div>
        
        <div className="mt-3 flex items-center text-sm text-neutral-500">
          <span className="truncate">Resources: {server.models.length} models</span>
          <span className="mx-1">•</span>
          <span>Type: {server.type}</span>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-neutral-700">CPU Usage</span>
            <span className="text-xs font-medium text-neutral-700">{server.cpuUsage}%</span>
          </div>
          <Progress value={server.cpuUsage} className="h-2 bg-neutral-200" indicatorClassName={getUsageColor(server.cpuUsage)} />
        </div>
        
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-neutral-700">Memory</span>
            <span className="text-xs font-medium text-neutral-700">{server.memoryUsage}/{server.totalMemory} GB</span>
          </div>
          <Progress value={memoryPercentage} className="h-2 bg-neutral-200" indicatorClassName={getUsageColor(memoryPercentage)} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-neutral-200 bg-neutral-50 px-5 py-3 flex justify-between">
        <Button variant="link" className="text-xs font-medium text-primary-700 hover:text-primary-900 p-0 h-auto">
          <Settings className="h-4 w-4 mr-1" />
          Configure
        </Button>
        <Button variant="link" className="text-xs font-medium text-neutral-700 hover:text-neutral-900 p-0 h-auto">
          <Eye className="h-4 w-4 mr-1" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
