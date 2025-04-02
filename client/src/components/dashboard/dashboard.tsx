import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsCard from "./stats-card";
import ServerCard from "./server-card";
import ActivityList from "../activity/activity-list";
import AppList from "../apps/app-list";
import AddServerDialog from "../servers/add-server-dialog";
import { Server, Stats } from "@/lib/types";
import { syncAllServers } from "@/lib/mcp";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Plus } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  
  // Fetch servers
  const { data: servers = [], isLoading: serversLoading } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });
  
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });
  
  // Handle sync all servers
  const handleSyncAll = async () => {
    try {
      await syncAllServers();
      toast({
        title: "Sync Completed",
        description: "All servers have been synchronized successfully",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize servers",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between pb-5 border-b border-neutral-200">
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="text-xs bg-secondary-600 hover:bg-secondary-700 text-white border-transparent flex items-center gap-1"
              onClick={handleSyncAll}
            >
              <RefreshCw className="h-4 w-4" />
              Sync All
            </Button>
            
            <Button 
              variant="default" 
              className="text-xs flex items-center gap-1"
              onClick={() => setIsAddServerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Server
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-white">
                <CardContent className="p-5">
                  <div className="h-20 animate-pulse bg-gray-200 rounded-md"></div>
                </CardContent>
              </Card>
            ))
          ) : stats ? (
            <>
              <StatsCard 
                title="Total Servers" 
                value={stats.totalServers.toString()}
                icon="server" 
                color="primary" 
                linkText="View all" 
                linkHref="/servers" 
              />
              <StatsCard 
                title="Active Servers" 
                value={stats.activeServers.toString()}
                icon="check-circle" 
                color="green" 
                linkText="View active" 
                linkHref="/servers" 
              />
              <StatsCard 
                title="Warnings" 
                value={stats.warningServers.toString()}
                icon="alert-triangle" 
                color="amber" 
                linkText="Resolve issues" 
                linkHref="/servers" 
              />
              <StatsCard 
                title="Connected Apps" 
                value={stats.connectedApps.toString()}
                icon="zap" 
                color="indigo" 
                linkText="Manage connections" 
                linkHref="/apps" 
              />
            </>
          ) : null}
        </div>

        {/* Server Cards */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">My MCP Servers</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serversLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="bg-white">
                  <CardContent className="p-5">
                    <div className="h-40 animate-pulse bg-gray-200 rounded-md"></div>
                  </CardContent>
                </Card>
              ))
            ) : servers.length > 0 ? (
              servers.map(server => (
                <ServerCard key={server.id} server={server} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-neutral-500">No servers found. Add your first server to get started.</p>
                <Button 
                  variant="default" 
                  className="mt-4"
                  onClick={() => setIsAddServerOpen(true)}
                >
                  Add Server
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Connected Apps */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">Connected Applications</h2>
          <AppList />
        </div>

        {/* Recent Activity */}
        <div className="mt-8 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-neutral-900">Recent Activity</h2>
            <a href="/activities" className="text-sm font-medium text-primary-600 hover:text-primary-900">View all</a>
          </div>
          <ActivityList limit={5} />
        </div>
      </div>

      {/* Add Server Dialog */}
      <AddServerDialog 
        open={isAddServerOpen} 
        onOpenChange={setIsAddServerOpen} 
      />
    </div>
  );
}
