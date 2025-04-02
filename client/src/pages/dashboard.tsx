import { useServers } from "@/hooks/use-servers";
import StatusSummary from "@/components/dashboard/StatusSummary";
import ServerCard from "@/components/dashboard/ServerCard";
import ConfigEditor from "@/components/dashboard/ConfigEditor";
import CommandTerminal from "@/components/dashboard/CommandTerminal";
import AddServerModal from "@/components/servers/AddServerModal";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: servers, isLoading } = useServers();
  
  return (
    <div className="py-6">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
        {/* Status summary */}
        <StatusSummary />
        
        {/* Server list */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Managed MCP Servers
          </h2>
          
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mb-4">
                <Skeleton className="h-[250px] w-full rounded-lg" />
              </div>
            ))
          ) : servers?.length > 0 ? (
            // Server cards
            servers.map((server: any) => (
              <ServerCard key={server.id} server={server} />
            ))
          ) : (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-500 dark:text-gray-400">
                No MCP servers found. Add a server to get started.
              </p>
            </div>
          )}
          
          {/* Add server button */}
          <div className="mt-4 text-center">
            <AddServerModal />
          </div>
        </div>
        
        {/* Configuration editor */}
        <ConfigEditor />
        
        {/* Command terminal */}
        <CommandTerminal />
      </div>
    </div>
  );
}
