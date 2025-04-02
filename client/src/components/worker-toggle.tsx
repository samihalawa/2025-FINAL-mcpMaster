import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Server } from "@/lib/types";
import { toggleWorkerMode } from "@/lib/mcp";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WorkerToggle() {
  const { toast } = useToast();
  const [isWorker, setIsWorker] = useState(false);
  
  // Fetch servers to find any in worker mode
  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });
  
  useEffect(() => {
    // Check if any servers are in worker mode
    const workerServer = servers.find(server => server.isWorker);
    setIsWorker(!!workerServer);
  }, [servers]);
  
  // Toggle worker mode on servers
  const mutation = useMutation({
    mutationFn: async () => {
      if (servers.length === 0) {
        throw new Error("No servers available");
      }
      
      // Find first active server or just use the first one
      const server = servers.find(s => s.status === 'active') || servers[0];
      await toggleWorkerMode(server.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      toast({
        title: isWorker ? "Worker Mode Disabled" : "Worker Mode Enabled",
        description: isWorker 
          ? "No longer accepting model requests as a worker node" 
          : "Now accepting model requests as a worker node",
      });
    },
    onError: (error) => {
      toast({
        title: "Toggle Failed",
        description: error instanceof Error ? error.message : "Failed to toggle worker mode",
        variant: "destructive",
      });
    }
  });
  
  const handleToggle = async () => {
    mutation.mutate();
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label htmlFor="worker-mode" className="text-sm font-medium text-neutral-700">
          Worker Mode
        </Label>
        <Switch 
          id="worker-mode" 
          checked={isWorker}
          onCheckedChange={handleToggle}
          disabled={mutation.isPending || servers.length === 0}
        />
      </div>
      <p className="text-xs text-neutral-500">
        {isWorker 
          ? "Currently accepting model requests as a worker node" 
          : "Enable to accept model requests as a worker node"
        }
      </p>
    </div>
  );
}
