import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw, Download, Upload } from "lucide-react";
import ApiKeyForm from "@/components/settings/ApiKeyForm";
import { 
  Select,
  SelectContent,
  SelectItem, 
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function Settings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    defaultServerPort: 11434,
    logFilePath: "./logs",
    maxLogFiles: 10,
    checkUpdatesOnStartup: true,
    autoStartServers: true,
    telemetryEnabled: false,
    theme: "system"
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    networkTimeout: 30000,
    maxConcurrentRequests: 10,
    connectionRetries: 3,
    proxyUrl: "",
    debugMode: false
  });

  // Fetch global configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/config/global"],
  });

  // Save settings
  const { mutate: saveSettings } = useMutation({
    mutationFn: async (settings: any) => {
      setIsUpdating(true);
      const res = await apiRequest("POST", "/api/config", {
        name: "global",
        value: {
          ...config?.value,
          ...settings
        }
      });
      return res.json();
    },
    onSuccess: () => {
      setIsUpdating(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/config/global"] });
    },
    onError: () => {
      setIsUpdating(false);
      toast({
        title: "Failed to save settings",
        description: "There was an error saving your settings",
        variant: "destructive"
      });
    }
  });

  const handleSaveGeneralSettings = () => {
    saveSettings(generalSettings);
  };

  const handleSaveAdvancedSettings = () => {
    saveSettings(advancedSettings);
  };

  const handleExportConfig = () => {
    if (!config) return;
    
    // Create a JSON blob and download it
    const dataStr = JSON.stringify(config.value, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "mcp-commander-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration exported",
      description: "Your configuration has been exported to a JSON file"
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedConfig = JSON.parse(content);
        
        // Save the imported config
        saveSettings(importedConfig);
        
        toast({
          title: "Configuration imported",
          description: "The configuration has been imported successfully"
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The selected file contains invalid JSON",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = "";
  };

  // Update form when config loads
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <div className="mt-6">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        
        <div className="mt-6">
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">General Settings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure basic settings for MCP Commander
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="default-port">Default Server Port</Label>
                        <Input 
                          id="default-port" 
                          type="number" 
                          value={generalSettings.defaultServerPort}
                          onChange={(e) => setGeneralSettings({
                            ...generalSettings,
                            defaultServerPort: parseInt(e.target.value)
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          The default port for new MCP servers
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="log-path">Log File Directory</Label>
                        <Input 
                          id="log-path" 
                          value={generalSettings.logFilePath}
                          onChange={(e) => setGeneralSettings({
                            ...generalSettings,
                            logFilePath: e.target.value
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          Where log files will be stored
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-logs">Maximum Log Files</Label>
                        <Input 
                          id="max-logs" 
                          type="number" 
                          value={generalSettings.maxLogFiles}
                          onChange={(e) => setGeneralSettings({
                            ...generalSettings,
                            maxLogFiles: parseInt(e.target.value)
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          Maximum number of log files to keep
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select 
                          value={generalSettings.theme} 
                          onValueChange={(value) => setGeneralSettings({
                            ...generalSettings,
                            theme: value
                          })}
                        >
                          <SelectTrigger id="theme">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Application appearance
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Behavior Settings</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="check-updates" className="block">
                            Check for Updates on Startup
                          </Label>
                          <p className="text-xs text-gray-500">
                            Automatically check for MCP Commander updates
                          </p>
                        </div>
                        <Switch 
                          id="check-updates" 
                          checked={generalSettings.checkUpdatesOnStartup}
                          onCheckedChange={(checked) => setGeneralSettings({
                            ...generalSettings,
                            checkUpdatesOnStartup: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-start" className="block">
                            Auto-start Enabled Servers
                          </Label>
                          <p className="text-xs text-gray-500">
                            Start servers with auto-start enabled when launching the app
                          </p>
                        </div>
                        <Switch 
                          id="auto-start" 
                          checked={generalSettings.autoStartServers}
                          onCheckedChange={(checked) => setGeneralSettings({
                            ...generalSettings,
                            autoStartServers: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="telemetry" className="block">
                            Enable Telemetry
                          </Label>
                          <p className="text-xs text-gray-500">
                            Send anonymous usage data to help improve the application
                          </p>
                        </div>
                        <Switch 
                          id="telemetry" 
                          checked={generalSettings.telemetryEnabled}
                          onCheckedChange={(checked) => setGeneralSettings({
                            ...generalSettings,
                            telemetryEnabled: checked
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        disabled={isUpdating}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* API Keys */}
            <TabsContent value="api-keys">
              <ApiKeyForm />
            </TabsContent>
            
            {/* Advanced Settings */}
            <TabsContent value="advanced">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Advanced Settings</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure technical settings for MCP Commander
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="network-timeout">Network Timeout (ms)</Label>
                        <Input 
                          id="network-timeout" 
                          type="number" 
                          value={advancedSettings.networkTimeout}
                          onChange={(e) => setAdvancedSettings({
                            ...advancedSettings,
                            networkTimeout: parseInt(e.target.value)
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          Timeout for network operations
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="max-concurrent">Max Concurrent Requests</Label>
                        <Input 
                          id="max-concurrent" 
                          type="number" 
                          value={advancedSettings.maxConcurrentRequests}
                          onChange={(e) => setAdvancedSettings({
                            ...advancedSettings,
                            maxConcurrentRequests: parseInt(e.target.value)
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          Maximum number of concurrent API requests
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="connection-retries">Connection Retries</Label>
                        <Input 
                          id="connection-retries" 
                          type="number" 
                          value={advancedSettings.connectionRetries}
                          onChange={(e) => setAdvancedSettings({
                            ...advancedSettings,
                            connectionRetries: parseInt(e.target.value)
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          Number of retry attempts for failed connections
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="proxy-url">Proxy URL (Optional)</Label>
                        <Input 
                          id="proxy-url" 
                          placeholder="http://proxy:port" 
                          value={advancedSettings.proxyUrl}
                          onChange={(e) => setAdvancedSettings({
                            ...advancedSettings,
                            proxyUrl: e.target.value
                          })}
                        />
                        <p className="text-xs text-gray-500">
                          HTTP proxy for outgoing connections
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="debug-mode" className="block">
                            Debug Mode
                          </Label>
                          <p className="text-xs text-gray-500">
                            Enable verbose logging and developer tools
                          </p>
                        </div>
                        <Switch 
                          id="debug-mode" 
                          checked={advancedSettings.debugMode}
                          onCheckedChange={(checked) => setAdvancedSettings({
                            ...advancedSettings,
                            debugMode: checked
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveAdvancedSettings}
                        disabled={isUpdating}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Advanced Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Backup & Restore */}
            <TabsContent value="backup">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Backup & Restore</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Export and import your MCP Commander configuration
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Export Configuration</h4>
                        <p className="text-sm text-gray-500">
                          Export your configuration as a JSON file for backup or transfer to another system.
                        </p>
                        <Button onClick={handleExportConfig}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Configuration
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Import Configuration</h4>
                        <p className="text-sm text-gray-500">
                          Import a previously exported configuration file.
                        </p>
                        <div className="flex items-center">
                          <Label htmlFor="import-config" className="cursor-pointer">
                            <Button asChild>
                              <div>
                                <Upload className="h-4 w-4 mr-2" />
                                Import Configuration
                              </div>
                            </Button>
                          </Label>
                          <Input 
                            id="import-config" 
                            type="file" 
                            accept=".json" 
                            className="hidden"
                            onChange={handleImportConfig}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Warning: This will override your current configuration
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Reset to Defaults</h4>
                      <p className="text-sm text-gray-500">
                        Reset all settings to default values. This cannot be undone.
                      </p>
                      <Button variant="destructive">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset All Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
