import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Key, Plus, Trash, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApiKeys } from "@/hooks/use-config";
import { toast } from "@/hooks/use-toast";

export default function ApiKeyForm() {
  const { apiKeys, isLoading, setApiKey, removeApiKey } = useApiKeys();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [anthropicKey, setAnthropicKey] = useState("");
  const [customKeys, setCustomKeys] = useState<Array<{ name: string, value: string }>>([]);
  const [addingCustomKey, setAddingCustomKey] = useState(false);
  const [customKeyName, setCustomKeyName] = useState("");
  const [customKeyValue, setCustomKeyValue] = useState("");

  // If api keys are loaded, populate the state
  if (!isLoading && Object.keys(apiKeys).length > 0 && anthropicKey === "" && customKeys.length === 0) {
    // Get Anthropic key if it exists
    if (apiKeys.anthropic) {
      setAnthropicKey(apiKeys.anthropic);
    }
    
    // Get other custom keys
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (key !== "anthropic") {
        setCustomKeys(prev => [...prev, { name: key, value: value as string }]);
      }
    });
  }

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveAnthropicKey = () => {
    if (!anthropicKey.trim()) {
      toast({
        title: "Validation error",
        description: "API key cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setApiKey("anthropic", anthropicKey);
    toast({
      title: "API key saved",
      description: "Your Anthropic API key has been saved"
    });
  };

  const handleAddCustomKey = () => {
    if (!customKeyName.trim() || !customKeyValue.trim()) {
      toast({
        title: "Validation error",
        description: "Both name and value are required",
        variant: "destructive"
      });
      return;
    }
    
    // Add to custom keys list
    setCustomKeys([...customKeys, { name: customKeyName, value: customKeyValue }]);
    
    // Save to API keys
    setApiKey(customKeyName, customKeyValue);
    
    // Reset form
    setCustomKeyName("");
    setCustomKeyValue("");
    setAddingCustomKey(false);
    
    toast({
      title: "Custom API key added",
      description: `${customKeyName} key has been saved`
    });
  };

  const handleRemoveCustomKey = (index: number) => {
    const keyToRemove = customKeys[index];
    removeApiKey(keyToRemove.name);
    
    setCustomKeys(customKeys.filter((_, i) => i !== index));
    
    toast({
      title: "API key removed",
      description: `${keyToRemove.name} key has been removed`
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">API Keys</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage API keys for your MCP servers
            </p>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>
              API keys are stored securely and never shared. They are only used to authenticate requests to the respective services.
            </AlertDescription>
          </Alert>
          
          {/* Anthropic API Key */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Anthropic API Key</h4>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => toggleShowKey('anthropic')}
                >
                  {showKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <Input
                      id="anthropic-key"
                      type={showKeys.anthropic ? "text" : "password"}
                      placeholder="sk-ant-..."
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      className="pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Key className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <Button 
                    className="ml-2" 
                    onClick={handleSaveAnthropicKey}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Required for using Claude models. Get your API key from the <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Anthropic Console</a>.
                </p>
              </div>
            </div>
          </div>
          
          {/* Custom API Keys */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Additional API Keys</h4>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAddingCustomKey(true)}
                disabled={addingCustomKey}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Key
              </Button>
            </div>
            
            {/* Add custom key form */}
            {addingCustomKey && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Service Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., openai, huggingface"
                      value={customKeyName}
                      onChange={(e) => setCustomKeyName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="key-value">API Key</Label>
                    <Input
                      id="key-value"
                      type="password"
                      placeholder="Enter API key"
                      value={customKeyValue}
                      onChange={(e) => setCustomKeyValue(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddingCustomKey(false);
                        setCustomKeyName("");
                        setCustomKeyValue("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCustomKey}>
                      Add Key
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Custom keys list */}
            {customKeys.length > 0 ? (
              <div className="space-y-3">
                {customKeys.map((key, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <h5 className="font-medium">{key.name}</h5>
                      <p className="text-sm text-gray-500">
                        {showKeys[key.name] ? key.value : '••••••••••••••••'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleShowKey(key.name)}
                      >
                        {showKeys[key.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleRemoveCustomKey(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No additional API keys configured
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
