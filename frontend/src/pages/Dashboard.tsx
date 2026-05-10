import { Trophy, Activity, Wallet, Target, ChevronRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBalance } from '../context/BalanceContext.tsx';

export default function Dashboard() {
  const { balance, league, level, xp, wageredAmount, wagerGoal } = useBalance();
  const xpToLevel = level * 100;
  
  const STATS = [
    { label: 'Current Balance', value: `${balance.toFixed(2)} COINS`, icon: Wallet, color: 'text-success' },
    { label: 'Win Rate', value: '54.2%', icon: Target, color: 'text-secondary' },
    { label: 'Experience', value: `${xp}/${xpToLevel} XP`, icon: Activity, color: 'text-warning' },
    { label: 'Current League', value: `${league}`, icon: Trophy, color: 'text-primary' },
  ];

  const RECENT_MATCHES = [
    { id: '1', game: 'Dice Casino', result: 'Win', amount: '+45.00 COINS', opponent: 'House', time: '2m ago' },
    { id: '2', game: 'Dice Duel', result: 'Loss', amount: '-50.00 COINS', opponent: 'SatoshiFan', time: '15m ago' },
    { id: '3', game: 'Plinko', result: 'Win', amount: '+12.50 COINS', opponent: 'House', time: '1h ago' },
    { id: '4', game: 'Shells PvP', result: 'Win', amount: '+80.00 COINS', opponent: 'MoonBoy', time: '3h ago' },
  ];

  const wagerPercentage = (wageredAmount / wagerGoal) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold">Welcome back, <span className="text-primary">Player</span></h2>
          <p className="text-gray-400 mt-2 text-lg">You are currently Level {level} in the {league} League.</p>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border-primary/20 flex flex-col gap-2 min-w-[250px]">
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Next League Progress</span>
            <span>{wageredAmount.toFixed(0)} / {wagerGoal} Wagered</span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-success to-secondary transition-all duration-1000" 
              style={{ width: `${wagerPercentage}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-gray-500 text-center italic">Wager {wagerGoal - wageredAmount} more to reach next Rank & increase Max Gain!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          const content = (
            <div key={idx} className="glass-panel rounded-xl p-6 relative overflow-hidden group h-full">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-500 blur-xl`}></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-white/5">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.label === 'Current League' && <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />}
              </div>
              <div className="text-2xl font-mono font-bold truncate">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1 font-medium">{stat.label}</div>
            </div>
          );

          if (stat.label === 'Current League') {
            return <Link key={idx} to="/ranks" className="block">{content}</Link>;
          }
          return content;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl p-8 relative overflow-hidden border-primary/10">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  <Zap className="w-4 h-4" /> Recommended
                </div>
                <h3 className="text-3xl font-display font-bold">Compete in PvP Ranked</h3>
                <p className="text-gray-400 max-w-md">
                  Challenge other players in skill-based crypto games. Climb the ladder and earn huge rewards for each league up.
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

          <div className="glass-panel rounded-xl p-8 relative overflow-hidden border-secondary/10">
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-40 h-40 relative hidden md:block">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-2xl"></div>
                <Target className="w-full h-full text-secondary drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
              </div>
              <div className="space-y-4 md:text-right flex-1">
                <h3 className="text-3xl font-display font-bold">Play Casual Casino</h3>
                <p className="text-gray-400 max-w-md ml-auto">
                  Relax with classic provably fair RNG games. Instant payouts and seamless experience. Great for building wager volume!
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
          <div className="glass-panel rounded-xl p-6 h-full border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-display">Activity</h3>
              <Link to="/history" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {RECENT_MATCHES.map((match) => (
                <div key={match.id} className="p-4 rounded-lg bg-surface/50 border border-white/5 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold group-hover:text-primary transition-colors">{match.game}</span>
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
