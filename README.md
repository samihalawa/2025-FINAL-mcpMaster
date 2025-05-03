[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/samihalawa-2025-final-mcpmaster-badge.png)](https://mseep.ai/app/samihalawa-2025-final-mcpmaster)

# MCP Manager

A flexible Model Context Protocol (MCP) manager server that enables communication between AI models and tools. Compatible with Claude, MCP Dockmaster, and other MCP clients.

## Features

- **MCP Server Management**: Run multiple MCP servers and manage them from a single interface
- **Worker Mode**: Operate as a worker for other MCP clients
- **Auto-Discovery**: Automatically find MCP servers on GitHub and from Smithery packages
- **Tool Registry**: Browse and install tools from a registry of MCP tools
- **WebSocket Communication**: JSON-RPC over WebSockets for real-time communication
- **Headless Mode**: Run in headless mode for API-first operation

## Getting Started

### Prerequisites

- Node.js (v18+)
- NPM (v8+)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-directory>

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env

# Edit .env to configure your MCP Manager
nano .env
```

### Running the Server

```bash
# Run in development mode
npm run dev

# Build and run in production mode
npm run build
npm run start
```

## Configuration Options

Configure your MCP Manager by editing the `.env` file:

```
# Server Configuration
PORT=5000                  # Main server port
HOST=0.0.0.0               # Host to bind to
NODE_ENV=development       # Environment (development/production)
REUSE_PORT=true            # Whether to reuse the port

# MCP Port Range
MCP_PORT_RANGE_START=50050 # Start port for MCP servers
MCP_PORT_RANGE_END=50150   # End port for MCP servers

# MCP Compatibility Settings
MCP_WORKER_MODE=false      # Enable worker mode
MCP_DISCOVERY_ENABLED=true # Enable auto-discovery of MCP servers
MCP_AUTOSTART_SERVERS=true # Automatically start MCP servers

# Smithery API Configuration
SMITHERY_API_KEY=your_smithery_api_key_here # API key for Smithery packages
```

## Using MCP Manager with Claude and Other MCP Clients

MCP Manager is designed to be compatible with various MCP clients, including:

- [Claude Desktop](https://claude.ai/desktop)
- [MCP Dockmaster](https://github.com/dcSpark/mcp-dockmaster)
- [Toolbase](https://github.com/Toolbase-AI/toolbase)
- Other MCP compatible clients

### Connecting to Claude Desktop

1. Run MCP Manager on your local machine
2. Open Claude Desktop
3. Go to Settings > Advanced > MCP Configuration
4. Set the MCP Server URL to `http://localhost:5000/ws`
5. MCP Manager will appear as an available server in Claude

### Connecting to MCP Dockmaster

1. Run MCP Manager on your local machine
2. Open MCP Dockmaster
3. Click "Add Server"
4. Enter the server information:
   - Name: MCP Manager
   - Address: localhost
   - Port: 5000
5. Click "Connect"

## Using Worker Mode

MCP Manager can operate as a worker for other MCP clients:

1. Set `MCP_WORKER_MODE=true` in your `.env` file
2. Run MCP Manager
3. Connect to MCP Manager from your MCP client
4. MCP Manager will automatically discover and register available tools

## Headless/API-First Operation

MCP Manager supports headless operation for API-first clients:

```
GET /?api_key=YOUR_API_KEY&headless=true&auto_connect=true
```

Query parameters:
- `api_key`: Your API key (if required)
- `headless`: Enable headless mode
- `auto_connect`: Automatically connect to available MCP servers
- `ws_url`: Specify a custom WebSocket URL
- `server_id`: Connect to a specific server ID

## API Reference

MCP Manager implements the JSON-RPC protocol over WebSockets. The main API endpoint is:

```
ws://localhost:5000/ws
```

### Available Methods

- `ping`: Test server connectivity
- `getServers`: Get all registered servers
- `getServer`: Get server by ID
- `toggleWorker`: Toggle worker status for a server
- `getTools`: Get all tools
- `getToolsByServer`: Get tools for a specific server
- `activateTool`: Activate a tool
- `deactivateTool`: Deactivate a tool
- `getStats`: Get server statistics

## License

MIT 