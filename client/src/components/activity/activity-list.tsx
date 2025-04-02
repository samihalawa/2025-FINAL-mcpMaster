import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Activity } from "@/lib/types";
import { getActivityIcon, getRelativeTime } from "@/lib/mcp";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Loader2
} from "lucide-react";

interface ActivityListProps {
  limit?: number;
  serverId?: number;
}

export default function ActivityList({ limit, serverId }: ActivityListProps) {
  // Build query key based on props
  const queryKey = serverId 
    ? [`/api/servers/${serverId}/activities`, limit ? `?limit=${limit}` : ''] 
    : ['/api/activities', limit ? `?limit=${limit}` : ''];
  
  // Fetch activities
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey,
  });
  
  // Get icon component based on activity type
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-primary-600" />;
    }
  };
  
  // Get background color class based on activity type
  const getBackgroundClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'warning':
        return 'bg-amber-100';
      case 'error':
        return 'bg-red-100';
      case 'info':
      default:
        return 'bg-primary-100';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      </Card>
    );
  }
  
  if (activities.length === 0) {
    return (
      <Card className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 text-center">
          <p className="text-neutral-500">No activity logs found.</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white shadow rounded-lg overflow-hidden">
      <ul className="divide-y divide-neutral-200">
        {activities.map((activity) => (
          <li key={activity.id} className="px-6 py-4">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md ${getBackgroundClass(activity.type)}`}>
                {getIconComponent(activity.type)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-900">{activity.message}</p>
                <p className="text-sm text-neutral-500">
                  {activity.serverId ? `Server ID: ${activity.serverId}` : 'System'} - {getRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
