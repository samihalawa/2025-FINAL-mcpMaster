import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SERVER_TYPES, MODEL_OPTIONS } from "@/lib/mcp";
import { Server } from "lucide-react";

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Create a schema for the form
const formSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  type: z.string().min(1, "Server type is required"),
  address: z.string().min(1, "Server address is required"),
  port: z.coerce.number().int().min(1).max(65535),
  models: z.array(z.string()).min(1, "Select at least one model"),
  isWorker: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddServerDialog({ open, onOpenChange }: AddServerDialogProps) {
  const { toast } = useToast();
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "local",
      address: "localhost",
      port: 8080,
      models: [],
      isWorker: false,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/servers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Server Added",
        description: "MCP server has been added successfully",
      });
      
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Server",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    data.models = selectedModels;
    mutation.mutate(data);
  };
  
  const toggleModel = (model: string) => {
    setSelectedModels(prev => {
      if (prev.includes(model)) {
        // Remove the model
        const newModels = prev.filter(m => m !== model);
        setValue("models", newModels);
        return newModels;
      } else {
        // Add the model
        const newModels = [...prev, model];
        setValue("models", newModels);
        return newModels;
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <Server className="h-6 w-6 text-primary-600" />
          </div>
          <DialogTitle className="text-center">Add New MCP Server</DialogTitle>
          <DialogDescription className="text-center">
            Configure a new MCP server to add to your management dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input 
                id="name" 
                placeholder="My MCP Server" 
                {...register("name")} 
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Server Type</Label>
              <Select 
                defaultValue="local" 
                onValueChange={(value) => setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select server type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVER_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Server Address</Label>
                <Input 
                  id="address" 
                  placeholder="localhost" 
                  {...register("address")} 
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input 
                  id="port" 
                  type="number" 
                  placeholder="8080" 
                  {...register("port")} 
                />
                {errors.port && (
                  <p className="text-red-500 text-xs mt-1">{errors.port.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Models</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {MODEL_OPTIONS.map((model) => (
                  <div key={model.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`model-${model.value}`} 
                      checked={selectedModels.includes(model.value)}
                      onCheckedChange={() => toggleModel(model.value)}
                    />
                    <Label 
                      htmlFor={`model-${model.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {model.label}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.models && (
                <p className="text-red-500 text-xs mt-1">{errors.models.message}</p>
              )}
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="worker-mode" 
                {...register("isWorker")} 
              />
              <div>
                <Label 
                  htmlFor="worker-mode"
                  className="text-sm font-medium cursor-pointer"
                >
                  Enable Worker Mode
                </Label>
                <p className="text-neutral-500 text-xs">
                  This server will accept model processing requests from applications.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Add Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
