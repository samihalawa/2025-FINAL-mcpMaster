import WebSocket from 'ws';

// Setup WebSocket connection
const ws = new WebSocket('ws://localhost:5000/ws');

// Listen for connection established
ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // JSON-RPC getServers message
  const serversMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getServers'
  };
  
  // Send the message
  ws.send(JSON.stringify(serversMessage));
  console.log('Sent JSON-RPC getServers request');
});

// Listen for messages from server
ws.on('message', (data) => {
  console.log('Received message:');
  try {
    const parsedData = JSON.parse(data.toString());
    console.log(JSON.stringify(parsedData, null, 2));
    
    // Close connection after receiving a response that isn't the connection message
    if (!parsedData.type || parsedData.type !== 'connection_established') {
      ws.close();
    }
  } catch (e) {
    console.error('Error parsing message:', e);
    console.log(data.toString());
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Handle connection close
ws.on('close', () => {
  console.log('Disconnected from WebSocket server');
  process.exit(0);
});