import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

// Default global configuration
const defaultConfig = {
  defaultModel: "claude-3.5-sonnet",
  defaultPort: 11434,
  apiKeySource: "environment",
  logLevel: "info",
  updateCheck: "daily",
  logDirectory: "./logs",
  maxLogs: 50,
  autoStartServers: true,
  apiKeys: {}
};

export interface GlobalConfig {
  defaultModel: string;
  defaultPort: number;
  apiKeySource: string;
  logLevel: string;
  updateCheck: string;
  logDirectory: string;
  maxLogs: number;
  autoStartServers: boolean;
  apiKeys: Record<string, string>;
  [key: string]: any;
}

// Hook for global configuration
export function useGlobalConfig() {
  // Fetch global configuration
  const query = useQuery<{ name: string; value: GlobalConfig }>({
    queryKey: ["/api/config/global"],
    staleTime: 60000, // 1 minute
  });

  // Update configuration
  const mutation = useMutation({
    mutationFn: async (newConfig: Partial<GlobalConfig>) => {
      const currentConfig = query.data?.value || defaultConfig;
      const mergedConfig = { ...currentConfig, ...newConfig };
      
      const res = await apiRequest("POST", "/api/config", {
        name: "global",
        value: mergedConfig
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
    onError: (error) => {
      toast({
        title: "Update failed",
        description: String(error) || "Could not update configuration",
        variant: "destructive"
      });
    }
  });

  // Get a configuration value with fallback to default
  const getConfigValue = <T,>(key: keyof GlobalConfig, defaultValue?: T): T => {
    const config = query.data?.value;
    
    if (!config || config[key] === undefined) {
      return (defaultConfig[key] ?? defaultValue) as T;
    }
    
    return config[key] as T;
  };

  // Set a configuration value
  const setConfigValue = <T,>(key: keyof GlobalConfig, value: T) => {
    mutation.mutate({ [key]: value });
  };

  // Set multiple configuration values at once
  const updateConfig = (newConfig: Partial<GlobalConfig>) => {
    mutation.mutate(newConfig);
  };

  return {
    config: query.data?.value || defaultConfig,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    updateConfig,
    getConfigValue,
    setConfigValue
  };
}

// Hook for API keys management
export function useApiKeys() {
  const { config, isLoading, updateConfig } = useGlobalConfig();
  
  const apiKeys = config.apiKeys || {};
  
  const setApiKey = (service: string, key: string) => {
    const updatedApiKeys = { ...apiKeys, [service]: key };
    updateConfig({ apiKeys: updatedApiKeys });
  };
  
  const removeApiKey = (service: string) => {
    const updatedApiKeys = { ...apiKeys };
    delete updatedApiKeys[service];
    updateConfig({ apiKeys: updatedApiKeys });
  };
  
  return {
    apiKeys,
    isLoading,
    setApiKey,
    removeApiKey
  };
}
