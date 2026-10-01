import app from "./app.js";
import { connectDB } from "./config/dbs.js";

import http from "http";
import { Server } from "socket.io";

import { setupSocket } from "./api/socket/socket.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server from express app
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  },
});

// Initialize socket events
setupSocket(io);

// Connect MongoDB
connectDB();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});