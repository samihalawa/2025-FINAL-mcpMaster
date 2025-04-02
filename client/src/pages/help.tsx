import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Help & Documentation</h1>
        
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions and answers about MCP Hub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is MCP Hub?</AccordionTrigger>
                    <AccordionContent>
                      MCP Hub is a comprehensive management tool for Model Control Protocol (MCP) servers. 
                      It allows you to easily install, configure, and manage MCP servers across different 
                      platforms and connect them to various AI applications like Claude, Claude Desktop, 
                      Cursor, and other tools.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What is Worker Mode?</AccordionTrigger>
                    <AccordionContent>
                      Worker Mode enables an MCP server to accept and process model requests from 
                      applications. When enabled, the server will function as a worker node in the 
                      MCP ecosystem, allowing connected applications to utilize the models it provides.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I connect an application to my MCP server?</AccordionTrigger>
                    <AccordionContent>
                      To connect an application to your MCP server, you'll need to configure the application 
                      to use the server's address and port. Most AI applications that support MCP will have 
                      a settings section where you can specify the MCP server details. Enter the address 
                      (e.g., localhost or IP address) and port of your MCP server, then the application 
                      should automatically connect.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Can I manage remote MCP servers?</AccordionTrigger>
                    <AccordionContent>
                      Yes, MCP Hub allows you to manage both local and remote MCP servers. When adding a 
                      new server, simply select "Remote Server" as the type and enter the appropriate 
                      address and port. Make sure the remote server is accessible from your network and 
                      any necessary firewalls are configured to allow the connection.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I sync configurations across multiple servers?</AccordionTrigger>
                    <AccordionContent>
                      You can use the "Sync All" button on the dashboard to synchronize configurations 
                      across all connected servers. This ensures that all your servers use consistent 
                      settings, making it easier to manage multiple environments.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="getting-started">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started Guide</CardTitle>
                <CardDescription>
                  Learn how to use MCP Hub effectively
                </CardDescription>
              </CardHeader>
              <CardContent className="prose">
                <h3>Introduction to MCP Hub</h3>
                <p>
                  MCP Hub is designed to simplify the management of Model Control Protocol servers, 
                  allowing you to connect various AI applications to language models efficiently.
                </p>
                
                <h3>Step 1: Adding Your First Server</h3>
                <p>
                  To add your first MCP server:
                </p>
                <ol>
                  <li>Click the "New Server" button on the dashboard</li>
                  <li>Enter a name for your server</li>
                  <li>Select the server type (local, remote, etc.)</li>
                  <li>Enter the address and port</li>
                  <li>Select the models you want to make available</li>
                  <li>Optionally enable Worker Mode</li>
                  <li>Click "Add Server" to create it</li>
                </ol>
                
                <h3>Step 2: Connecting Applications</h3>
                <p>
                  Once your server is running, you can connect applications to it:
                </p>
                <ol>
                  <li>Open your AI application (Claude Desktop, Cursor, etc.)</li>
                  <li>Navigate to the application's settings</li>
                  <li>Look for MCP or API configuration options</li>
                  <li>Enter your server's address and port</li>
                  <li>Save the settings and restart the application if necessary</li>
                </ol>
                
                <h3>Step 3: Managing Your Servers</h3>
                <p>
                  MCP Hub provides several tools for managing your servers:
                </p>
                <ul>
                  <li>Monitor server status and resource usage on the dashboard</li>
                  <li>Configure server settings by clicking the "Configure" button</li>
                  <li>View connected applications in the "Connected Applications" section</li>
                  <li>Track server activity in the "Recent Activity" section</li>
                  <li>Use the "Sync All" button to synchronize configurations across servers</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="troubleshooting">
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting</CardTitle>
                <CardDescription>
                  Common issues and how to resolve them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="issue-1">
                    <AccordionTrigger>Server shows "Warning" status</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">A warning status typically indicates that the server is running but 
                      experiencing issues. Common causes include:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>High resource usage (CPU or memory)</li>
                        <li>Connection issues with models</li>
                        <li>Timeout problems with requests</li>
                      </ul>
                      <p className="mt-2">Check the server details page for specific warning messages and 
                      inspect the server logs for more information.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="issue-2">
                    <AccordionTrigger>Application can't connect to server</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">If an application cannot connect to your MCP server:</p>
                      <ol className="list-decimal pl-6 space-y-1">
                        <li>Verify the server is running (status should be "Active")</li>
                        <li>Check that the address and port in the application match your server</li>
                        <li>Ensure there are no firewall rules blocking the connection</li>
                        <li>Verify network connectivity between the application and server</li>
                        <li>Check if the server has Worker Mode enabled</li>
                      </ol>
                      <p className="mt-2">You can test the connection by using a tool like curl or Postman 
                      to make a request to the server's API endpoint.</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="issue-3">
                    <AccordionTrigger>High CPU or memory usage</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">If your server is showing high resource usage:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Check how many models are loaded on the server</li>
                        <li>Reduce the number of active models if possible</li>
                        <li>Consider upgrading the server's hardware if it's consistently overloaded</li>
                        <li>Check for unusual activity patterns in the logs</li>
                        <li>Restart the server to clear any memory leaks</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="issue-4">
                    <AccordionTrigger>Sync operation fails</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">If configuration synchronization fails:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Check that all servers are running and accessible</li>
                        <li>Verify network connectivity between MCP Hub and all servers</li>
                        <li>Look for specific error messages in the activity log</li>
                        <li>Try syncing individual servers instead of all at once</li>
                      </ul>
                      <p className="mt-2">If problems persist, you may need to manually configure each server.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
