// Configuration manager for MCP servers

// Default global configuration
export const defaultGlobalConfig = {
  defaultModel: "claude-3.5-sonnet",
  defaultPort: 11434,
  apiKeySource: "environment",
  logLevel: "info",
  updateCheck: "daily",
  logDirectory: "./logs",
  maxLogs: 50
};

// Default server configuration template
export const defaultServerConfig = {
  contextWindow: 100000,
  temperature: 0.7,
  topP: 1.0,
  topK: 0
};

// Model-specific defaults
export const modelDefaults = {
  "claude-3.5-sonnet": {
    contextWindow: 200000,
    temperature: 0.7
  },
  "claude-3-opus": {
    contextWindow: 200000,
    temperature: 0.5
  },
  "claude-3-sonnet": {
    contextWindow: 100000,
    temperature: 0.7
  },
  "claude-3-haiku": {
    contextWindow: 100000,
    temperature: 0.8
  }
};

// Get config for a specific model
export function getModelConfig(model: string) {
  return modelDefaults[model as keyof typeof modelDefaults] || defaultServerConfig;
}

// Create a complete server configuration
export function createServerConfig(
  name: string,
  port: number,
  model: string,
  autoStart: boolean
) {
  const modelConfig = getModelConfig(model);
  
  return {
    name,
    port,
    model,
    autoStart,
    config: { ...modelConfig }
  };
}

// Validate a configuration object
export function validateConfig(config: any): string[] {
  const errors: string[] = [];
  
  // Check required fields
  if (!config.defaultModel) {
    errors.push("Default model is required");
  }
  
  if (!config.defaultPort) {
    errors.push("Default port is required");
  } else if (config.defaultPort < 1024 || config.defaultPort > 65535) {
    errors.push("Default port must be between 1024 and 65535");
  }
  
  if (!config.apiKeySource) {
    errors.push("API key source is required");
  }
  
  if (!config.logLevel) {
    errors.push("Log level is required");
  }
  
  return errors;
}

// Export configuration as string
export function exportConfig(config: any): string {
  return JSON.stringify(config, null, 2);
}

// Import configuration from string
export function importConfig(configString: string): any {
  try {
    return JSON.parse(configString);
  } catch (error) {
    throw new Error("Invalid configuration format");
  }
}

// Merge configurations
export function mergeConfigs(baseConfig: any, newConfig: any): any {
  return {
    ...baseConfig,
    ...newConfig,
    // Deep merge for nested objects if needed
    servers: {
      ...(baseConfig.servers || {}),
      ...(newConfig.servers || {})
    }
  };
}
