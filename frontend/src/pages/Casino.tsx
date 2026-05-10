import { useState } from 'react';
import { Dice5, Zap, Swords, Coins, Trophy, Spade } from 'lucide-react';

const CASINO_GAMES = [
  { id: 'crash', name: 'House Crash', icon: Zap, desc: 'Classic crash. Multiply your crypto instantly.', houseEdge: '1%' },
  { id: 'dice', name: 'Provably Fair Dice', icon: Dice5, desc: 'Set your win chance. Instant payouts.', houseEdge: '1%' },
  { id: 'plinko', name: 'Plinko', icon: Coins, desc: 'Drop the ball. Watch your multiplier grow.', houseEdge: '1.5%' },
  { id: 'shells', name: 'Shell Game', icon: Trophy, desc: 'Find the ball under the cups. High multipliers.', houseEdge: '1.5%' },
  { id: 'roulette', name: 'Cyber Roulette', icon: Swords, desc: 'Classic table game with a modern twist.', houseEdge: '2.7%' },
  { id: 'blackjack', name: 'Blackjack', icon: Spade, desc: 'Beat the dealer to 21. Standard 3:2 rules.', houseEdge: '0.5%' },
];

import { useNavigate } from 'react-router-dom';

export default function Casino() {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold flex items-center gap-3">
            <Dice5 className="w-10 h-10 text-secondary" />
            Hexbet <span className="text-secondary">Casino</span>
          </h2>
          <p className="text-gray-400 mt-2 text-lg">Instant play, provably fair RNG games against the house.</p>
        </div>
        
        <div className="flex bg-surface rounded-lg p-1 border border-white/10">
          {['All Games', 'Originals', 'Slots', 'Live'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === tab.toLowerCase() ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {CASINO_GAMES.map((game) => {
          const Icon = game.icon;
          return (
            <div 
              key={game.id} 
              onClick={() => navigate(`/casino/${game.id}`)}
              className="group cursor-pointer relative"
            >
              <div className="aspect-[4/5] rounded-[32px] bg-card/40 border border-white/[0.03] overflow-hidden relative transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
                
                {/* Game Icon/Visual */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Icon className="w-20 h-20 text-white/10 group-hover:text-primary transition-all duration-500 group-hover:scale-110 relative z-10" />
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="font-display font-bold text-lg md:text-xl text-white group-hover:text-primary transition-colors leading-tight">
                    {game.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-success">Play Now</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel rounded-xl p-8 relative overflow-hidden mt-12 border-secondary/20">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
          <h3 className="text-3xl font-display font-bold">Provably Fair System</h3>
          <p className="text-gray-400">
            We use a transparent cryptographic system to ensure that neither the house nor the player can know the outcome of a game before it starts.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="btn-secondary py-2 px-6 text-sm">Verify Game</button>
            <button className="text-sm text-secondary hover:underline font-medium">Read Docs</button>
          </div>
        </div>
      </div>
      
      {/* Live Bets Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold font-display flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            Live Bets
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 text-gray-400 text-sm font-bold uppercase tracking-wider">
                <th className="p-4">Game</th>
                <th className="p-4">Player</th>
                <th className="p-4">Bet Amount</th>
                <th className="p-4">Multiplier</th>
                <th className="p-4 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { game: 'Dice', player: 'Hidden', bet: '50.00 COINS', mult: '2.00x', payout: '100.00 COINS', win: true },
                { game: 'Crash', player: 'CryptoPro', bet: '10.00 COINS', mult: '-', payout: '0.00 COINS', win: false },
                { game: 'Roulette', player: 'Hidden', bet: '25.00 COINS', mult: '14.00x', payout: '350.00 COINS', win: true },
                { game: 'Plinko', player: 'MoonBoy', bet: '5.00 COINS', mult: '0.50x', payout: '2.50 COINS', win: false },
                { game: 'Crash', player: 'Whale', bet: '200.00 COINS', mult: '1.50x', payout: '300.00 COINS', win: true },
              ].map((bet, i) => (
                <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{bet.game}</td>
                  <td className="p-4 text-gray-400">{bet.player}</td>
                  <td className="p-4 font-mono">{bet.bet}</td>
                  <td className="p-4 font-mono">{bet.mult}</td>
                  <td className={`p-4 text-right font-mono font-bold ${bet.win ? 'text-success' : 'text-gray-500'}`}>
                    {bet.payout}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
