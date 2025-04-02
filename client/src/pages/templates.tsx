import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TemplatesPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Server Templates</h1>
        
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="custom">My Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic MCP Server</CardTitle>
                <CardDescription>Standard configuration for general use</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A simple MCP server configuration with standard settings
                  suitable for most applications. Includes Claude and GPT models.
                </p>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Models:</span>
                    <span>4</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Resources:</span>
                    <span>Minimal</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Worker Mode:</span>
                    <span>Enabled</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Development Server</CardTitle>
                <CardDescription>Optimized for development environments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configured for developer tools like IDEs, code editors and 
                  CLI interfaces. Includes logging and debugging features.
                </p>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Models:</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Resources:</span>
                    <span>Medium</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Worker Mode:</span>
                    <span>Enabled</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>High-Performance</CardTitle>
                <CardDescription>Optimized for maximum throughput</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  For production environments requiring high performance and 
                  reliability. Includes load balancing and advanced caching.
                </p>
                <div className="mt-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Models:</span>
                    <span>All</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Resources:</span>
                    <span>High</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Worker Mode:</span>
                    <span>Configurable</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="popular" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Claude Desktop</CardTitle>
                <CardDescription>Optimized for Claude Desktop app</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Specifically designed for seamless integration with Claude 
                  Desktop application with optimal configuration.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cursor Configuration</CardTitle>
                <CardDescription>Best settings for Cursor IDE</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Optimized for code generation and assistance in the Cursor IDE
                  with fine-tuned parameters for development workflows.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Use Template</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-neutral-500 mb-4">You haven't created any custom templates yet.</p>
              <Button>Create Template</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
