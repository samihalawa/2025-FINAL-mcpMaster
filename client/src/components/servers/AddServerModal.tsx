import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateServer } from "@/hooks/use-servers";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function AddServerModal() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    port: "11434",
    model: "claude-3.5-sonnet",
    autoStart: false
  });

  const { mutate: createServer, isPending } = useCreateServer();

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Server name is required",
        variant: "destructive"
      });
      return;
    }
    
    // Create server
    createServer(
      {
        name: formData.name,
        port: parseInt(formData.port),
        model: formData.model,
        autoStart: formData.autoStart,
        status: "inactive",
        cpuUsage: 0,
        memory: 0,
        uptime: 0,
        config: {
          contextWindow: formData.model.includes("opus") ? 200000 : 100000,
          temperature: 0.7
        },
        connectedApps: []
      },
      {
        onSuccess: () => {
          toast({
            title: "Server created",
            description: `${formData.name} has been added successfully`
          });
          setOpen(false);
          // Reset form
          setFormData({
            name: "",
            port: "11434",
            model: "claude-3.5-sonnet",
            autoStart: false
          });
        },
        onError: () => {
          toast({
            title: "Creation failed",
            description: "Could not create server",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add New MCP Server
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New MCP Server</DialogTitle>
          <DialogDescription>
            Set up a new MCP server for your AI applications.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Claude Desktop MCP"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port
              </Label>
              <Input
                id="port"
                type="number"
                className="col-span-3"
                value={formData.port}
                onChange={(e) => handleChange("port", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Select
                value={formData.model}
                onValueChange={(value) => handleChange("model", value)}
              >
                <SelectTrigger id="model" className="col-span-3">
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="auto-start" className="text-right">
                Auto-start
              </Label>
              <div className="flex items-center col-span-3">
                <Switch
                  id="auto-start"
                  checked={formData.autoStart}
                  onCheckedChange={(checked) => handleChange("autoStart", checked)}
                />
                <span className="ml-2 text-sm text-gray-500">
                  Start server automatically on application launch
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
