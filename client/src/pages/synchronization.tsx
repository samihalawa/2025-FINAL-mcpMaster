import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import SyncTargetCard from "@/components/synchronization/SyncTargetCard";
import { RefreshCw, ArrowRightLeft, AlertTriangle, Check } from "lucide-react";

interface SyncTarget {
  id: string;
  name: string;
  type: string;
  icon: string;
  connectedServers: number;
  lastSynced: string;
  status: "synced" | "pending" | "error" | "never";
}

export default function Synchronization() {
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [syncType, setSyncType] = useState<string>("bidirectional");

  // Fetch configuration
  const { data: config } = useQuery({
    queryKey: ["/api/config/global"],
  });

  // Fetch servers
  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
  });

  // Simulate sync targets data
  const syncTargets: SyncTarget[] = [
    {
      id: "claude-desktop",
      name: "Claude Desktop",
      type: "application",
      icon: "desktop",
      connectedServers: 1,
      lastSynced: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: "synced",
    },
    {
      id: "cursor",
      name: "Cursor",
      type: "application",
      icon: "code",
      connectedServers: 1,
      lastSynced: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: "pending",
    },
    {
      id: "cline",
      name: "Cline",
      type: "application",
      icon: "terminal",
      connectedServers: 1,
      lastSynced: "", // Never synced
      status: "never",
    },
  ];

  // Sync mutation
  const { mutate: syncConfig } = useMutation({
    mutationFn: async (data: { targets: string[]; type: string }) => {
      // Simulate a sync operation with progress
      setSyncInProgress(true);
      setSyncProgress(0);

      // Progress updates
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setSyncProgress(i);
      }

      // Simulate API request
      const res = await apiRequest("POST", "/api/execute-command", {
        command: "sync config",
      });
      return res.json();
    },
    onSuccess: () => {
      setSyncInProgress(false);
      toast({
        title: "Synchronization complete",
        description: "Configuration has been synced across all selected targets",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/command-logs"] });
    },
    onError: () => {
      setSyncInProgress(false);
      toast({
        title: "Synchronization failed",
        description: "Failed to sync configuration",
        variant: "destructive",
      });
    },
  });

  const handleToggleAll = () => {
    if (selectedTargets.length === syncTargets.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(syncTargets.map((target) => target.id));
    }
  };

  const toggleTarget = (targetId: string) => {
    if (selectedTargets.includes(targetId)) {
      setSelectedTargets(selectedTargets.filter((id) => id !== targetId));
    } else {
      setSelectedTargets([...selectedTargets, targetId]);
    }
  };

  const handleSync = () => {
    if (selectedTargets.length === 0) {
      toast({
        title: "No targets selected",
        description: "Please select at least one sync target",
        variant: "destructive",
      });
      return;
    }

    syncConfig({
      targets: selectedTargets,
      type: syncType,
    });
  };

  const getSyncIcon = () => {
    switch (syncType) {
      case "bidirectional":
        return <ArrowRightLeft className="h-4 w-4 mr-2" />;
      case "pull":
        return <RefreshCw className="h-4 w-4 mr-2" />;
      case "push":
        return <ArrowRightLeft className="h-4 w-4 mr-2" />;
      default:
        return <RefreshCw className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Configuration Synchronization
        </h1>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sync Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">Sync Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Synchronization Type
                    </label>
                    <Select
                      value={syncType}
                      onValueChange={setSyncType}
                      disabled={syncInProgress}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bidirectional">
                          Bidirectional Sync
                        </SelectItem>
                        <SelectItem value="push">
                          Push Configuration Only
                        </SelectItem>
                        <SelectItem value="pull">
                          Pull Configuration Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Auto-sync Frequency
                    </label>
                    <Select defaultValue="manual" disabled={syncInProgress}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Only</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={handleSync}
                      disabled={
                        syncInProgress || selectedTargets.length === 0
                      }
                    >
                      {syncInProgress ? (
                        "Syncing..."
                      ) : (
                        <>
                          {getSyncIcon()}
                          Synchronize Now
                        </>
                      )}
                    </Button>
                  </div>

                  {syncInProgress && (
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Syncing...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <Progress value={syncProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="text-md font-medium">Status Summary</h3>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Synced: 1</span>
                    </div>
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>Pending: 1</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      <span>Error: 0</span>
                    </div>
                    <div className="flex items-center">
                      <span className="h-4 w-4 bg-gray-300 rounded-full mr-2"></span>
                      <span>Never: 1</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Targets */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">Sync Targets</h2>
                  <div className="flex items-center">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedTargets.length === syncTargets.length &&
                        syncTargets.length > 0
                      }
                      onCheckedChange={handleToggleAll}
                      disabled={syncInProgress}
                    />
                    <label
                      htmlFor="select-all"
                      className="ml-2 text-sm font-medium cursor-pointer"
                    >
                      Select All
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  {syncTargets.map((target) => (
                    <SyncTargetCard
                      key={target.id}
                      target={target}
                      checked={selectedTargets.includes(target.id)}
                      onToggle={() => toggleTarget(target.id)}
                      disabled={syncInProgress}
                    />
                  ))}

                  {syncTargets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No sync targets available.</p>
                      <p className="text-sm mt-1">
                        Add MCP servers and connect applications first.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sync History */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4">
                  Synchronization History
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Time</th>
                        <th className="text-left py-2 font-medium">Type</th>
                        <th className="text-left py-2 font-medium">Targets</th>
                        <th className="text-left py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">Today, 10:45 AM</td>
                        <td className="py-2">Bidirectional</td>
                        <td className="py-2">Claude Desktop</td>
                        <td className="py-2 text-green-500">Success</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">Yesterday, 3:22 PM</td>
                        <td className="py-2">Push</td>
                        <td className="py-2">Cursor, Claude Desktop</td>
                        <td className="py-2 text-green-500">Success</td>
                      </tr>
                      <tr>
                        <td className="py-2">Jun 1, 2025, 8:15 AM</td>
                        <td className="py-2">Pull</td>
                        <td className="py-2">Cursor</td>
                        <td className="py-2 text-red-500">Failed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
