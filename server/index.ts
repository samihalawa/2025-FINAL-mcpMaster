import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config, validateConfig } from "./config";
import { initializeDiscovery } from "./registry-manager";
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { storage } from './storage';
import routes from './routes';

const app = express();
const server = createServer(app);

// Set up WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: config.WS_PATH
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate config and log any warnings
  validateConfig();
  
  // Initialize MCP server discovery
  await initializeDiscovery();
  
  // Register API routes and get HTTP server
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite development server or static file serving
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use port from configuration
  const port = config.PORT;
  server.listen(port, '0.0.0.0', () => {
    log(`MCP Manager server running in ${app.get("env")} mode at http://0.0.0.0:${port}`);
    log(`Worker mode: ${config.MCP_WORKER_MODE ? 'Enabled' : 'Disabled'}`);
    log(`Auto-discovery: ${config.MCP_DISCOVERY_ENABLED ? 'Enabled' : 'Disabled'}`);
  });
})();

// Initialize storage
(async () => {
  try {
    await storage.initialize();
    console.log('Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
})();

// Register routes
app.use(routes);

// Add a simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the client build directory if in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const clientBuildDir = path.resolve(__dirname, '../../client/build');
  
  app.use(express.static(clientBuildDir));
  
  // For any request not matched by our API, serve the SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildDir, 'index.html'));
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send initial data
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to MCP server' }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Add message handling logic here
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
