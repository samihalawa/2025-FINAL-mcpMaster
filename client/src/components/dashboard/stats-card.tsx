import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon, Server, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { Link } from "wouter";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
  linkText: string;
  linkHref: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  linkText,
  linkHref
}: StatsCardProps) {
  // Get background color class based on the color prop
  const getBgColorClass = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-100 text-primary-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'amber':
        return 'bg-amber-100 text-amber-600';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-neutral-100 text-neutral-600';
    }
  };
  
  // Get icon component based on the icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'server':
        return <Server className="h-6 w-6" />;
      case 'check-circle':
        return <CheckCircle className="h-6 w-6" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-6 w-6" />;
      case 'zap':
        return <Zap className="h-6 w-6" />;
      default:
        return <Server className="h-6 w-6" />;
    }
  };

  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${getBgColorClass(color)}`}>
            {getIconComponent(icon)}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-neutral-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-primary-700 hover:text-primary-900">
            {linkText}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
