import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupMatchmaking } from './socket/matchmaking';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', activePlayers: io.engine.clientsCount });
});

// Setup WebSockets for PvP Matchmaking
setupMatchmaking(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Hexbet Backend running on port ${PORT}`);
});
