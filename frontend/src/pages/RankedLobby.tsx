import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords, Zap, Shield, Users, Dice5, Target } from 'lucide-react';
import { socket } from '../App';

const GAMES = [
  { id: 'crash', name: 'Crash PvP', icon: Zap, desc: 'Hold your nerve. Last one to cash out before the crash wins the pot.', players: 452 },
  { id: 'dice', name: 'Dice Duel', icon: Dice5, desc: 'Comparative risk system. Roll higher or predict better than your opponent.', players: 891 },
  { id: 'shell', name: 'Shell Duel', icon: Target, desc: 'Follow the prize. Strategy meets intuition in this high-speed game.', players: 215 },
  { id: 'cards', name: 'Card Battle', icon: Swords, desc: 'High-stakes card mechanics. Strategy meets luck in intense 1v1s.', players: 320 },
];

export default function RankedLobby() {
  const [selectedGame, setSelectedGame] = useState(GAMES[1].id); // Default to dice
  const [isSearching, setIsSearching] = useState(false);
  const [stake, setStake] = useState<number>(0.1);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for match_found
    socket.on('match_found', (data: { matchId: string; opponent: string }) => {
      setIsSearching(false);
      if (selectedGame === 'dice') {
        navigate(`/ranked/dice/${data.matchId}`);
      } else if (selectedGame === 'shell') {
        navigate(`/ranked/shell/${data.matchId}`);
      } else {
        alert("Match found! Joining game...");
      }
    });

    return () => {
      socket.off('match_found');
    };
  }, [navigate, selectedGame]);

  const handleQueue = () => {
    setIsSearching(true);
    // Send join queue event to backend
    socket.emit('join_queue', {
      userId: 'GuestPlayer_' + Math.floor(Math.random() * 1000), // mock userId
      rank: 1842, // mock ELO
      gameType: selectedGame,
      stake: stake
    });
  };

  const handleCancelQueue = () => {
    setIsSearching(false);
    socket.emit('leave_queue');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold flex items-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Ranked <span className="text-primary">Arena</span>
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Compete against real players in skill-based crypto matches.</p>
        </div>
        
        <div className="glass-panel px-6 py-4 rounded-xl flex items-center gap-6 border-primary/20">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Your Rank</div>
            <div className="text-xl font-display font-bold text-primary drop-shadow-[0_0_10px_rgba(255,42,95,0.5)]">Gold III</div>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">ELO</div>
            <div className="text-xl font-mono font-bold">1,842</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-display font-bold">Select Game Mode</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {GAMES.map((game) => {
              const Icon = game.icon;
              const isSelected = selectedGame === game.id;
              return (
                <div 
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`glass-panel rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                    isSelected ? 'border-primary shadow-[0_0_20px_rgba(255,42,95,0.2)] bg-primary/5 scale-[1.02]' : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-surface px-2 py-1 rounded">
                      <Users className="w-3 h-3" /> {game.players}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{game.name}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{game.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="glass-panel rounded-xl p-8 relative overflow-hidden mt-8">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-surface border-t-primary border-r-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Swords className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-display animate-pulse">Searching for Opponent...</h3>
                  <p className="text-gray-400 mt-2 font-mono">Estimated time: 00:15</p>
                </div>
                <button 
                  onClick={handleCancelQueue}
                  className="btn-secondary mt-4"
                >
                  Cancel Matchmaking
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-6">
                <div className="w-full max-w-md space-y-4">
                  <div className="flex justify-between text-sm font-bold text-gray-400">
                    <span>Select Stake</span>
                    <span className="text-white">Balance: 2.450 ETH</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['0.01', '0.05', '0.1', '0.5'].map(val => (
                      <button 
                        key={val} 
                        onClick={() => setStake(Number(val))}
                        className={`py-2 bg-surface border rounded-lg hover:border-primary hover:text-primary transition-colors font-mono font-bold ${stake === Number(val) ? 'border-primary text-primary shadow-[0_0_10px_rgba(255,42,95,0.2)]' : 'border-white/10'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={stake}
                      onChange={(e) => setStake(Number(e.target.value))}
                      placeholder="Custom Amount" 
                      className="w-full bg-surface border border-white/10 rounded-lg py-3 px-4 outline-none focus:border-primary transition-colors font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">ETH</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleQueue}
                  className="btn-primary w-full max-w-md py-4 text-xl flex justify-center items-center gap-3"
                >
                  <Swords className="w-6 h-6" />
                  Find Match
                </button>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <Shield className="w-4 h-4" />
                  Provably fair matching & automated escrow
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Top Players
            </h3>
            <div className="space-y-4">
              {[
                { rank: 1, name: 'CryptoKing', elo: '2,940', tier: 'Diamond I' },
                { rank: 2, name: 'WhaleHunter', elo: '2,815', tier: 'Diamond II' },
                { rank: 3, name: 'SatoshiFan', elo: '2,750', tier: 'Diamond II' },
                { rank: 4, name: 'MoonBoy', elo: '2,690', tier: 'Diamond III' },
                { rank: 5, name: 'DegenPro', elo: '2,500', tier: 'Platinum I' },
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg bg-surface/30 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${
                      player.rank === 1 ? 'bg-warning/20 text-warning' :
                      player.rank === 2 ? 'bg-gray-300/20 text-gray-300' :
                      player.rank === 3 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/5 text-gray-400'
                    }`}>
                      #{player.rank}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{player.name}</div>
                      <div className="text-xs text-gray-400">{player.tier}</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-primary text-sm">{player.elo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
