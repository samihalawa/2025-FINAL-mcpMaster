import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupWebSocket } from "./lib/mcp";

// Setup WebSocket connection for real-time updates
setupWebSocket();

createRoot(document.getElementById("root")!).render(<App />);
