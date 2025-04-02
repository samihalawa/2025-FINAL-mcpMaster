import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, RefreshCw, AlertTriangle, Laptop, Code, Terminal } from "lucide-react";

interface SyncTarget {
  id: string;
  name: string;
  type: string;
  icon: string;
  connectedServers: number;
  lastSynced: string;
  status: "synced" | "pending" | "error" | "never";
}

interface SyncTargetCardProps {
  target: SyncTarget;
  checked: boolean;
  onToggle: (targetId: string) => void;
  disabled?: boolean;
}

export default function SyncTargetCard({
  target,
  checked,
  onToggle,
  disabled = false,
}: SyncTargetCardProps) {
  // Get the appropriate icon based on the target type
  const getIcon = () => {
    switch (target.icon) {
      case "desktop":
        return <Laptop className="h-5 w-5" />;
      case "code":
        return <Code className="h-5 w-5" />;
      case "terminal":
        return <Terminal className="h-5 w-5" />;
      default:
        return <Laptop className="h-5 w-5" />;
    }
  };

  // Get status information based on sync status
  const getStatusInfo = () => {
    switch (target.status) {
      case "synced":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: "Synced",
          bgColor: "bg-green-50 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-300",
        };
      case "pending":
        return {
          icon: <RefreshCw className="h-4 w-4 text-yellow-500" />,
          text: "Pending",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
          textColor: "text-yellow-700 dark:text-yellow-300",
        };
      case "error":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
          text: "Error",
          bgColor: "bg-red-50 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-300",
        };
      case "never":
        return {
          icon: <RefreshCw className="h-4 w-4 text-gray-400" />,
          text: "Never Synced",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-300",
        };
      default:
        return {
          icon: <RefreshCw className="h-4 w-4 text-gray-400" />,
          text: "Unknown",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          textColor: "text-gray-700 dark:text-gray-300",
        };
    }
  };

  const status = getStatusInfo();
  const icon = getIcon();

  return (
    <Card
      className={`border ${
        checked ? "border-primary-200 dark:border-primary-800" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center">
          <Checkbox
            id={`target-${target.id}`}
            checked={checked}
            onCheckedChange={() => onToggle(target.id)}
            disabled={disabled}
          />
          
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-50 dark:bg-primary-900 p-2 rounded-full">
                  {icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{target.name}</h3>
                  <p className="text-xs text-gray-500">
                    {target.connectedServers} 
                    {target.connectedServers === 1 ? " server" : " servers"} connected
                  </p>
                </div>
              </div>
              
              <div 
                className={`px-2 py-1 rounded text-xs flex items-center ${status.bgColor} ${status.textColor}`}
              >
                {status.icon}
                <span className="ml-1">{status.text}</span>
              </div>
            </div>
            
            {target.lastSynced && (
              <div className="mt-2 text-xs text-gray-500">
                Last synchronized: {formatDistanceToNow(new Date(target.lastSynced), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
