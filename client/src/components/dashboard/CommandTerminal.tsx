import { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Quick commands for the terminal
const quickCommands = [
  "list servers",
  "start server <name>",
  "stop server <name>",
  "check updates",
  "sync config"
];

export default function CommandTerminal() {
  const [command, setCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  // Fetch command logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/command-logs"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Execute command
  const { mutate: executeCommand, isPending: isExecuting } = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await apiRequest("POST", "/api/execute-command", { command: cmd });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/command-logs"] });
      setCommand("");
    },
    onError: () => {
      toast({
        title: "Command failed",
        description: "Could not execute command",
        variant: "destructive"
      });
    }
  });

  // Scroll to bottom when logs change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle command submission
  const handleSubmitCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim()) return;
    
    executeCommand(command);
  };

  // Handle quick command selection
  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
    // If it doesn't contain a placeholder, execute immediately
    if (!cmd.includes("<")) {
      executeCommand(cmd);
    }
  };

  // Helper to format log output based on status
  const formatLog = (log: any) => {
    if (!log) return null;
    
    let commandClass = "terminal-command";
    let outputClass = "";
    
    if (log.status === "success") {
      outputClass = "terminal-success";
    } else if (log.status === "error") {
      outputClass = "terminal-error";
    }
    
    return (
      <>
        <div className={`mb-1 ${commandClass}`}>&gt; {log.command}</div>
        <div className={`mb-1 ${outputClass}`}>
          {log.command === "list servers" ? (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pr-4">Name</th>
                  <th className="pr-4">Status</th>
                  <th className="pr-4">Port</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  try {
                    const data = JSON.parse(log.output);
                    return data.map((server: any, index: number) => (
                      <tr key={index}>
                        <td className="pr-4">{server.name}</td>
                        <td className={`pr-4 ${server.status === "Running" ? "terminal-success" : ""}`}>
                          {server.status}
                        </td>
                        <td className="pr-4">{server.port}</td>
                        <td>{server.model}</td>
                      </tr>
                    ));
                  } catch (e) {
                    return (
                      <tr>
                        <td colSpan={4}>Error parsing server list</td>
                      </tr>
                    );
                  }
                })()}
              </tbody>
            </table>
          ) : (
            log.output
          )}
        </div>
      </>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Command Console</h2>
      
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <div 
            className="terminal rounded-md p-3 text-sm bg-gray-900 text-gray-200 font-mono" 
            style={{ height: "200px", overflowY: "auto" }}
            ref={terminalRef}
          >
            {isLoading ? (
              <div className="mb-1">Loading command history...</div>
            ) : logs?.length > 0 ? (
              logs.map((log: any) => (
                <div key={log.id}>
                  {formatLog(log)}
                </div>
              ))
            ) : (
              <div className="mb-1">MCP Commander initialized. Type a command to begin.</div>
            )}
            <div className="mb-1 terminal-command">&gt; {isExecuting ? command : ""}</div>
          </div>
          
          <form onSubmit={handleSubmitCommand} className="mt-3 flex">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">&gt;</span>
              </div>
              <Input
                type="text"
                name="command"
                id="command"
                className="pl-7"
                placeholder="Enter command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={isExecuting}
              />
            </div>
            <Button 
              type="submit"
              className="ml-2 flex items-center" 
              disabled={isExecuting || !command.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Execute
            </Button>
          </form>
          
          <div className="mt-3">
            <div className="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400">
              <span className="mr-3">Quick Commands:</span>
              {quickCommands.map((cmd) => (
                <button
                  key={cmd}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 mr-2 mb-2"
                  onClick={() => handleQuickCommand(cmd)}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
