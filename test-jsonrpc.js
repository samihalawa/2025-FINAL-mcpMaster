// Test client for MCP JSON-RPC WebSocket API
// Run with: node test-jsonrpc.js

import WebSocket from 'ws';

// Default to localhost, but allow command-line override
const host = process.argv[2] || 'localhost:5000';
const wsUrl = `ws://${host}/ws`;

console.log(`Connecting to MCP server at ${wsUrl}...`);

const ws = new WebSocket(wsUrl);

// Helper function to make JSON-RPC requests
function jsonRpcRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    // Create a unique ID for this request
    const id = Date.now();
    
    // Create the JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    
    // Set up a one-time message handler to catch the response
    const messageHandler = (data) => {
      const response = JSON.parse(data);
      
      // Check if this is a response to our request
      if (response.id === id) {
        // Remove the message listener to avoid memory leaks
        ws.removeListener('message', messageHandler);
        
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      }
    };
    
    // Add the temporary message handler
    ws.on('message', messageHandler);
    
    // Send the request
    ws.send(JSON.stringify(request));
    
    // Set a timeout to clean up the handler and reject the promise if no response
    setTimeout(() => {
      ws.removeListener('message', messageHandler);
      reject(new Error(`Request for ${method} timed out`));
    }, 5000);
  });
}

// Connection event handlers
ws.on('open', async () => {
  console.log('Connected to MCP server');
  
  try {
    // Test ping
    console.log('\nTesting ping...');
    const pingResult = await jsonRpcRequest('ping');
    console.log('Ping result:', pingResult);
    
    // Get servers
    console.log('\nGetting servers...');
    const servers = await jsonRpcRequest('getServers');
    console.log(`Found ${servers.length} servers:`);
    servers.forEach(server => {
      console.log(`- ${server.name} (${server.status}) ${server.isWorker ? '[WORKER]' : ''}`);
    });
    
    // If we have a server, try getting its details
    if (servers.length > 0) {
      const firstServer = servers[0];
      console.log(`\nGetting details for server ${firstServer.id} (${firstServer.name})...`);
      const serverDetails = await jsonRpcRequest('getServer', { id: firstServer.id });
      console.log('Server details:', serverDetails);
      
      // Test toggling worker mode
      console.log(`\nToggling worker mode for server ${firstServer.id}...`);
      const toggleResult = await jsonRpcRequest('toggleWorker', { id: firstServer.id });
      console.log('Worker mode toggled:', toggleResult.isWorker ? 'ON' : 'OFF');
    }
    
    // Get tools
    console.log('\nGetting tools...');
    const tools = await jsonRpcRequest('getTools');
    console.log(`Found ${tools.length} tools:`);
    tools.forEach(tool => {
      console.log(`- ${tool.name} (${tool.active ? 'active' : 'inactive'})`);
    });
    
    // If we have a tool, try activating/deactivating it
    if (tools.length > 0) {
      const firstTool = tools[0];
      
      if (!firstTool.active) {
        console.log(`\nActivating tool ${firstTool.id} (${firstTool.name})...`);
        const activateResult = await jsonRpcRequest('activateTool', { id: firstTool.id });
        console.log('Tool activated:', activateResult.active ? 'YES' : 'NO');
      } else {
        console.log(`\nDeactivating tool ${firstTool.id} (${firstTool.name})...`);
        const deactivateResult = await jsonRpcRequest('deactivateTool', { id: firstTool.id });
        console.log('Tool deactivated:', !deactivateResult.active ? 'YES' : 'NO');
      }
    }
    
    // Get stats
    console.log('\nGetting server stats...');
    const stats = await jsonRpcRequest('getStats');
    console.log('Server stats:', stats);
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Close the connection
    ws.close();
  }
});

ws.on('message', (data) => {
  // Log any unexpected messages
  try {
    const message = JSON.parse(data);
    if (message.type === 'connection_established') {
      console.log('Connection confirmed by server at', message.data.timestamp);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
  process.exit(1);
});