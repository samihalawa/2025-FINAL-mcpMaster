import { useServerStats } from "@/hooks/use-servers";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function StatusSummary() {
  const { data: stats, isLoading } = useServerStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-5 w-full">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Active Servers Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Servers</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.activeServers || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <Link href="/servers" className="font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
              View all
            </Link>
          </div>
        </div>
      </Card>

      {/* Warning Servers Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Updates</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.warningServers || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <Link href="/sync" className="font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
              Update all
            </Link>
          </div>
        </div>
      </Card>

      {/* Idle Servers Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md p-3">
              <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Idle Servers</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">
                    {stats?.inactiveServers || 0}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <Link href="/servers" className="font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
              View all
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
