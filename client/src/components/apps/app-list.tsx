import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { App } from "@/lib/types";
import { getStatusColor, getRelativeTime } from "@/lib/mcp";
import { Loader2 } from "lucide-react";

export default function AppList() {
  // Fetch apps
  const { data: apps = [], isLoading } = useQuery<App[]>({
    queryKey: ['/api/apps'],
  });
  
  // Fetch servers for naming in the list
  const { data: servers = [] } = useQuery({
    queryKey: ['/api/servers'],
  });
  
  // Get server name by ID
  const getServerName = (serverId: number) => {
    const server = servers.find(s => s.id === serverId);
    return server ? server.name : `Server #${serverId}`;
  };
  
  // Get app icon letter
  const getAppIconLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Get color classes for app type
  const getAppColorClasses = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop app':
        return 'bg-indigo-100 text-indigo-600';
      case 'ide':
        return 'bg-amber-100 text-amber-600';
      case 'cli tool':
        return 'bg-purple-100 text-purple-600';
      case 'web app':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      </Card>
    );
  }
  
  if (apps.length === 0) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-neutral-500">No connected applications found.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Connected Server</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md ${getAppColorClasses(app.type)}`}>
                      <span className="text-lg font-semibold">{getAppIconLetter(app.name)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">{app.name}</div>
                      <div className="text-sm text-neutral-500">Version {app.version}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-900">{app.type}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-900">{getServerName(app.serverId)}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-neutral-500">{getRelativeTime(app.lastActive)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-primary-600 hover:text-primary-900">
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
