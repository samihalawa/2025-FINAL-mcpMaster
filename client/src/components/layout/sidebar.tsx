import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Server, 
  FileText, 
  Settings as SettingsIcon, 
  HelpCircle
} from "lucide-react";
import WorkerToggle from "../worker-toggle";

export default function Sidebar() {
  const [location] = useLocation();
  
  // Check if current location matches the specified path
  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };
  
  // Navigation items
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home className="mr-3 h-5 w-5" /> },
    { path: '/servers', label: 'My Servers', icon: <Server className="mr-3 h-5 w-5" /> },
    { path: '/templates', label: 'Templates', icon: <FileText className="mr-3 h-5 w-5" /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon className="mr-3 h-5 w-5" /> },
    { path: '/help', label: 'Help & Docs', icon: <HelpCircle className="mr-3 h-5 w-5" /> }
  ];
  
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-neutral-200 bg-white">
        <div className="flex items-center h-16 px-4 border-b border-neutral-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary-600">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div className="ml-2">
              <h1 className="text-lg font-semibold text-neutral-900">MCP Hub</h1>
              <p className="text-xs text-neutral-500">Server Manager</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="p-4 border-t border-neutral-200">
            <WorkerToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
