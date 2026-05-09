import { Trophy, Activity, Wallet, Target, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Total Matches', value: '142', icon: Activity, color: 'text-secondary' },
  { label: 'Win Rate', value: '54.2%', icon: Target, color: 'text-success' },
  { label: 'Total Winnings', value: '12.5 ETH', icon: Wallet, color: 'text-warning' },
  { label: 'Current Rank', value: 'Gold III', icon: Trophy, color: 'text-primary' },
];

const RECENT_MATCHES = [
  { id: '1', game: 'Crash PvP', result: 'Win', amount: '+0.5 ETH', opponent: 'CryptoKing', time: '2m ago' },
  { id: '2', game: 'Dice Duel', result: 'Loss', amount: '-0.1 ETH', opponent: 'SatoshiFan', time: '15m ago' },
  { id: '3', game: 'Crash PvP', result: 'Win', amount: '+1.2 ETH', opponent: 'WhaleHunter', time: '1h ago' },
  { id: '4', game: 'Card Battle', result: 'Win', amount: '+0.2 ETH', opponent: 'MoonBoy', time: '3h ago' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display font-bold">Welcome back, <span className="text-primary">PlayerOne</span></h2>
          <p className="text-gray-400 mt-2 text-lg">Ready to climb the ranks today?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel rounded-xl p-6 relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-500 blur-xl`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-mono font-bold">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-display font-bold">Compete in PvP Ranked</h3>
                <p className="text-gray-400 max-w-md">
                  Challenge other players in skill-based crypto games. Climb the ELO ladder and earn exclusive rewards.
                </p>
                <Link to="/ranked" className="btn-primary inline-flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Enter Arena
                </Link>
              </div>
              <div className="w-48 h-48 relative animate-float">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                <Trophy className="w-full h-full text-primary drop-shadow-[0_0_15px_rgba(255,42,95,0.5)]" />
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-8 relative overflow-hidden">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-40 h-40 relative hidden md:block">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl"></div>
                <Target className="w-full h-full text-secondary drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
              </div>
              <div className="space-y-4 md:text-right flex-1">
                <h3 className="text-3xl font-display font-bold">Play Casual Casino</h3>
                <p className="text-gray-400 max-w-md ml-auto">
                  Relax with classic provably fair RNG games. Instant payouts and seamless experience.
                </p>
                <Link to="/casino" className="btn-secondary inline-flex items-center gap-2">
                  Play Casino
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-display">Recent Matches</h3>
              <Link to="/history" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {RECENT_MATCHES.map((match) => (
                <div key={match.id} className="p-4 rounded-lg bg-surface/50 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{match.game}</span>
                    <span className={`font-mono font-bold ${match.result === 'Win' ? 'text-success' : 'text-danger'}`}>
                      {match.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>vs {match.opponent}</span>
                    <span>{match.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
