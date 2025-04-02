import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Server, 
  FileText, 
  Settings as SettingsIcon, 
  HelpCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import WorkerToggle from "../worker-toggle";
import { McpConnection } from "../mcp-connection";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
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
    <div className="lg:hidden">
      <div className="flex items-center justify-between bg-white h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full">
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
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-neutral-200">
                  <WorkerToggle />
                  <div className="mt-4">
                    <McpConnection />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-2">
            <h1 className="text-lg font-semibold text-neutral-900">MCP Hub</h1>
            <p className="text-xs text-neutral-500">Server Manager</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <McpConnection />
        </div>
      </div>
    </div>
  );
}
