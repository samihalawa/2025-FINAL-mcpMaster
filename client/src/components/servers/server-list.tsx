import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ServerCard from "../dashboard/server-card";
import AddServerDialog from "./add-server-dialog";
import { Server } from "@/lib/types";
import { Plus } from "lucide-react";

export default function ServerList() {
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  
  // Fetch servers
  const { data: servers = [], isLoading } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">My Servers</h1>
        <Button 
          onClick={() => setIsAddServerOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Server
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
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
      
      <AddServerDialog 
        open={isAddServerOpen} 
        onOpenChange={setIsAddServerOpen} 
      />
    </div>
  );
}
