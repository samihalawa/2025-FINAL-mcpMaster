import { Search, Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface TopBarProps {
  toggleSidebar: () => void;
}

export default function TopBar({ toggleSidebar }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow">
      {/* Mobile menu button */}
      <button 
        type="button" 
        className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 md:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between">
        {/* Search bar */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <input
                id="search-field"
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-0 focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Search servers"
                type="search"
              />
            </div>
          </div>
        </div>
        
        {/* Right side buttons */}
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button
            type="button"
            className="bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Dark/Light mode toggle */}
          <button
            type="button"
            className="ml-3 bg-white dark:bg-gray-800 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            onClick={toggleTheme}
          >
            <span className="sr-only">Toggle dark mode</span>
            {theme === 'dark' ? (
              <Sun className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Moon className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
