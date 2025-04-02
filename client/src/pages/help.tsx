import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle, Book, FileText, Terminal, MessageSquare } from "lucide-react";

export default function Help() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Help & Documentation</h1>
          <Button className="flex items-center" variant="outline" asChild>
            <a href="https://mcp-dockmaster.com/documentation" target="_blank" rel="noopener noreferrer">
              <Book className="h-4 w-4 mr-2" />
              Full Documentation
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
        
        <div className="mt-6">
          <Tabs defaultValue="getting-started">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
              <TabsTrigger value="commands">Commands</TabsTrigger>
            </TabsList>
            
            {/* Getting Started */}
            <TabsContent value="getting-started">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center sm:text-left flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-full">
                        <HelpCircle className="h-8 w-8 text-primary-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Welcome to MCP Commander</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          The easiest way to manage MCP servers across all your devices and applications.
                          Follow these steps to get started with MCP Commander.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-medium flex items-center">
                            <span className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                            Create Your First MCP Server
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            From the Dashboard, click "Add New MCP Server" and provide a name, port, and select your Claude model.
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-medium flex items-center">
                            <span className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                            Configure API Keys
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Go to Settings &gt; API Keys and add your Anthropic API key to enable MCP servers to access Claude models.
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-medium flex items-center">
                            <span className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                            Start Your Server
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Click the "Start" button on your server card. Your MCP server is now running and ready to connect to your applications.
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h3 className="font-medium flex items-center">
                            <span className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                            Connect Applications
                          </h3>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Configure Claude Desktop, Cursor, or Cline to connect to your MCP server using the provided port.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg border border-primary-100 dark:border-primary-900">
                      <h3 className="font-medium">Video Tutorial</h3>
                      <p className="mt-1 text-sm">
                        Watch our getting started video for a step-by-step guide to setting up your first MCP server.
                      </p>
                      <Button className="mt-3" variant="outline" asChild>
                        <a href="https://mcp-dockmaster.com/tutorial" target="_blank" rel="noopener noreferrer">
                          Watch Tutorial <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* FAQ */}
            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>What is MCP Commander?</AccordionTrigger>
                      <AccordionContent>
                        MCP Commander is a management tool for MCP (Model Control Protocol) servers that allows you to easily install, configure, and manage servers for AI applications like Claude Desktop, Cursor, and Cline. It supports both manager and worker node functions, enabling seamless integration across your AI toolchain.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What's the difference between MCP Commander and MCP Dockmaster?</AccordionTrigger>
                      <AccordionContent>
                        MCP Commander builds on the foundation of MCP Dockmaster with enhanced synchronization capabilities, a simpler interface, and the ability to function as both a manager and a worker node. It offers one-click synchronization across applications and improved configuration management.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Do I need an API key to use MCP Commander?</AccordionTrigger>
                      <AccordionContent>
                        Yes, you'll need an Anthropic API key to access Claude models through MCP servers. You can enter your API key in Settings &gt; API Keys. MCP Commander securely stores and manages your key for all connected servers.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>Can I run multiple MCP servers with different models?</AccordionTrigger>
                      <AccordionContent>
                        Absolutely! MCP Commander is designed to manage multiple servers running different Claude models. Each server can be configured with unique settings and API keys, allowing you to use different models for different applications.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-5">
                      <AccordionTrigger>How does synchronization work?</AccordionTrigger>
                      <AccordionContent>
                        MCP Commander's synchronization feature allows you to keep configurations consistent across multiple servers and applications. You can choose bidirectional sync to merge changes, or push/pull configurations in one direction. Changes are automatically pushed to all connected applications.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-6">
                      <AccordionTrigger>Is MCP Commander available for all operating systems?</AccordionTrigger>
                      <AccordionContent>
                        Yes, MCP Commander is available for Windows, macOS, and Linux. The application provides native installers for each platform and offers the same features and capabilities across all supported operating systems.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-7">
                      <AccordionTrigger>Can I use MCP Commander with other AI applications?</AccordionTrigger>
                      <AccordionContent>
                        MCP Commander is designed to work with any application that supports the Model Control Protocol standard. While it's optimized for Claude Desktop, Cursor, and Cline, it can integrate with any MCP-compatible application or service.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Troubleshooting */}
            <TabsContent value="troubleshooting">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium">Connection Issues</h3>
                      <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Problem:</strong> Unable to connect to MCP server.</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Check if the server is running in the dashboard</li>
                          <li>Verify the port is not being used by another application</li>
                          <li>Ensure your firewall is not blocking the connection</li>
                          <li>Try restarting the server from the dashboard</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium">API Key Errors</h3>
                      <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Problem:</strong> "Invalid API key" or authorization errors.</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Verify your API key in Settings &gt; API Keys</li>
                          <li>Ensure your API key has the correct permissions</li>
                          <li>Check if your API key has expired or reached its rate limit</li>
                          <li>Restart the server after updating the API key</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium">Synchronization Issues</h3>
                      <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Problem:</strong> Configuration won't sync between applications.</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Ensure all applications are running and connected</li>
                          <li>Check for any connectivity issues between devices</li>
                          <li>Verify you have the right permissions on all systems</li>
                          <li>Try a manual sync from the Synchronization page</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium">Performance Issues</h3>
                      <div className="mt-2 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>Problem:</strong> MCP server is running slowly or using excessive resources.</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Check the CPU and memory usage on the server card</li>
                          <li>Reduce the context window size for better performance</li>
                          <li>Ensure you're not running too many concurrent requests</li>
                          <li>Consider using a lighter model like Claude 3 Haiku for less demanding tasks</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Still Having Issues?</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        If you're still experiencing problems, please reach out to our support team:
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                          <a href="https://mcp-dockmaster.com/support" target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact Support
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="https://github.com/dcSpark/mcp-dockmaster/issues" target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            Report Issue on GitHub
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Commands */}
            <TabsContent value="commands">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Command Reference</h2>
                  
                  <div className="space-y-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      MCP Commander provides a command interface for managing servers. 
                      You can use these commands in the Command Console on the Dashboard.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4 font-medium">Command</th>
                            <th className="text-left py-2 px-4 font-medium">Description</th>
                            <th className="text-left py-2 px-4 font-medium">Example</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">list servers</td>
                            <td className="py-2 px-4">List all configured MCP servers</td>
                            <td className="py-2 px-4 font-mono">list servers</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">start server &lt;name&gt;</td>
                            <td className="py-2 px-4">Start a specific MCP server</td>
                            <td className="py-2 px-4 font-mono">start server Cursor MCP</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">stop server &lt;name&gt;</td>
                            <td className="py-2 px-4">Stop a running MCP server</td>
                            <td className="py-2 px-4 font-mono">stop server Cursor MCP</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">restart server &lt;name&gt;</td>
                            <td className="py-2 px-4">Restart a running MCP server</td>
                            <td className="py-2 px-4 font-mono">restart server Cursor MCP</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">check updates</td>
                            <td className="py-2 px-4">Check for available updates for servers</td>
                            <td className="py-2 px-4 font-mono">check updates</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">sync config</td>
                            <td className="py-2 px-4">Synchronize configuration across all servers</td>
                            <td className="py-2 px-4 font-mono">sync config</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 px-4 font-mono">status &lt;name&gt;</td>
                            <td className="py-2 px-4">Show detailed status of a server</td>
                            <td className="py-2 px-4 font-mono">status Cursor MCP</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 font-mono">help</td>
                            <td className="py-2 px-4">Show available commands</td>
                            <td className="py-2 px-4 font-mono">help</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium flex items-center">
                        <Terminal className="h-5 w-5 mr-2 text-primary-500" />
                        CLI Mode
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        MCP Commander also provides a command-line interface for server management. 
                        You can use the <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">mcp-commander</code> command 
                        in your terminal with the same commands listed above.
                      </p>
                      <div className="mt-3 bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                        $ mcp-commander list servers<br />
                        $ mcp-commander start server "Claude Desktop MCP"<br />
                        $ mcp-commander status "Cursor MCP"
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
