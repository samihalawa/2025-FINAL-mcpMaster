import { useLocation, Link } from "wouter";
import { Dns, Dashboard, Storage, Sync, Settings, HelpOutline } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  // Navigation items with their paths and icons
  const navItems = [
    { name: "Dashboard", path: "/", icon: Dashboard },
    { name: "Servers", path: "/servers", icon: Storage },
    { name: "Synchronization", path: "/sync", icon: Sync },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Help", path: "/help", icon: HelpOutline },
  ];

  return (
    <div className="flex flex-col w-64">
      <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-5 pb-4 overflow-y-auto">
        {/* App logo and title */}
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <Dns className="h-6 w-6 text-primary-500 mr-2" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">MCP Commander</h1>
        </div>

        {/* Navigation items */}
        <div className="mt-3 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`${
                    isActive 
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <Icon 
                    className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" 
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                <span className="text-xs font-medium">JD</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
