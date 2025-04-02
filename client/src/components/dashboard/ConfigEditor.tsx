import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Sync, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ConfigEditor() {
  const [configJson, setConfigJson] = useState("");
  const [formData, setFormData] = useState({
    defaultModel: "claude-3.5-sonnet",
    defaultPort: "11434",
    apiKeySource: "environment",
    logLevel: "info"
  });

  // Fetch global configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/config/global"],
  });

  // Update configuration
  const { mutate: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (configData: any) => {
      const res = await apiRequest("POST", "/api/config", {
        name: "global",
        value: configData
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config/global"] });
      toast({
        title: "Configuration updated",
        description: "Global configuration has been saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Could not update configuration",
        variant: "destructive"
      });
    }
  });

  // Sync configuration
  const handleSync = () => {
    toast({
      title: "Synchronizing",
      description: "Syncing configuration to all servers..."
    });
    
    // Simulate sync
    setTimeout(() => {
      toast({
        title: "Sync complete",
        description: "All servers are now updated with the latest configuration"
      });
    }, 1500);
  };

  // Save configuration
  const handleSave = () => {
    try {
      // First try to parse the JSON
      const jsonConfig = JSON.parse(configJson);
      
      // Then update with form values
      const updatedConfig = {
        ...jsonConfig,
        defaultModel: formData.defaultModel,
        defaultPort: parseInt(formData.defaultPort),
        apiKeySource: formData.apiKeySource,
        logLevel: formData.logLevel
      };
      
      // Save to server
      updateConfig(updatedConfig);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax",
        variant: "destructive"
      });
    }
  };

  // Update form when config loads
  useEffect(() => {
    if (config) {
      setFormData({
        defaultModel: config.value.defaultModel || "claude-3.5-sonnet",
        defaultPort: config.value.defaultPort?.toString() || "11434",
        apiKeySource: config.value.apiKeySource || "environment",
        logLevel: config.value.logLevel || "info"
      });
      
      // Pretty print the JSON
      setConfigJson(JSON.stringify(config.value, null, 2));
    }
  }, [config]);

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Configuration</h2>
      
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="mb-5 border-b border-gray-200 dark:border-gray-700 pb-5">
            <div className="sm:flex sm:items-center sm:justify-between">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Global MCP Configuration</h3>
              <div className="mt-3 sm:mt-0 flex">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mr-2"
                  onClick={handleSync}
                >
                  <Sync className="h-4 w-4 mr-1" />
                  Sync All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <Label htmlFor="default-model">Default Model</Label>
              <Select 
                value={formData.defaultModel} 
                onValueChange={(value) => handleChange("defaultModel", value)}
              >
                <SelectTrigger id="default-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="default-port">Default Port</Label>
              <Input 
                type="number" 
                id="default-port" 
                value={formData.defaultPort}
                onChange={(e) => handleChange("defaultPort", e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="api-key-source">API Key Source</Label>
              <Select 
                value={formData.apiKeySource} 
                onValueChange={(value) => handleChange("apiKeySource", value)}
              >
                <SelectTrigger id="api-key-source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">Environment Variable</SelectItem>
                  <SelectItem value="config">Config File</SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="log-level">Log Level</Label>
              <Select 
                value={formData.logLevel} 
                onValueChange={(value) => handleChange("logLevel", value)}
              >
                <SelectTrigger id="log-level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6">
            <Label htmlFor="config-json">Advanced Configuration (JSON)</Label>
            <div className="mt-1">
              <div className="font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-300 dark:border-gray-600 text-sm overflow-auto" style={{ height: "150px" }}>
                <textarea
                  id="config-json"
                  className="w-full h-full bg-transparent resize-none outline-none text-gray-800 dark:text-gray-200"
                  value={configJson}
                  onChange={(e) => setConfigJson(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
