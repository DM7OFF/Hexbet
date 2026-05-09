import { Server, Socket } from 'socket.io';

interface Player {
  socketId: string;
  userId: string;
  rank: number;
  gameType: string;
  stake: number;
}

const queue: Player[] = [];
const activeMatches: Record<string, { p1: Player; p2: Player; gameType: string; stake: number }> = {};

export function setupMatchmaking(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('join_queue', (data: { userId: string; rank: number; gameType: string; stake: number }) => {
      const player: Player = { ...data, socketId: socket.id };
      queue.push(player);
      console.log(`Player ${player.userId} joined queue for ${player.gameType}`);

      matchPlayers(io);
    });

    socket.on('leave_queue', () => {
      const index = queue.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        queue.splice(index, 1);
        console.log(`Player left queue: ${socket.id}`);
      }
    });

    socket.on('disconnect', () => {
      const index = queue.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        queue.splice(index, 1);
      }
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}

function matchPlayers(io: Server) {
  if (queue.length < 2) return;

  for (let i = 0; i < queue.length; i++) {
    for (let j = i + 1; j < queue.length; j++) {
      const p1 = queue[i];
      const p2 = queue[j];

      // Match criteria: Same game, same stake, similar rank (within 100 ELO)
      if (p1.gameType === p2.gameType && 
          p1.stake === p2.stake && 
          Math.abs(p1.rank - p2.rank) <= 100) {
        
        // Match found!
        const matchId = `match_${p1.userId}_${p2.userId}_${Date.now()}`;
        activeMatches[matchId] = { p1, p2, gameType: p1.gameType, stake: p1.stake };

        // Remove from queue
        queue.splice(j, 1);
        queue.splice(i, 1);

        // Notify players
        io.to(p1.socketId).emit('match_found', { matchId, opponent: p2.userId });
        io.to(p2.socketId).emit('match_found', { matchId, opponent: p1.userId });

        console.log(`Match started: ${matchId}`);
        
        // Break to restart matching process
        return matchPlayers(io);
      }
    }
  }
}
