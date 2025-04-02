import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Link } from "wouter";

interface StatusCardProps {
  title: string;
  count: number;
  icon: "active" | "warning" | "idle";
  linkText: string;
  linkHref: string;
  isLoading?: boolean;
}

export default function StatusCard({
  title,
  count,
  icon,
  linkText,
  linkHref,
  isLoading = false,
}: StatusCardProps) {
  // Configure icon and colors based on status type
  const getIconConfig = () => {
    switch (icon) {
      case "active":
        return {
          bg: "bg-green-100 dark:bg-green-900",
          icon: <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />,
        };
      case "warning":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900",
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
        };
      case "idle":
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          icon: <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          icon: <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
        };
    }
  };

  const { bg, icon: IconComponent } = getIconConfig();

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bg} rounded-md p-3`}>
            {IconComponent}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {isLoading ? "-" : count}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <Link
            href={linkHref}
            className="font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            {linkText}
          </Link>
        </div>
      </div>
    </Card>
  );
}
