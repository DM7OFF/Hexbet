import { Trophy, Shield, Zap, Star, Crown, ChevronRight, User, Medal } from 'lucide-react';
import { useBalance } from '../context/BalanceContext.tsx';

const RANKS_INFO = [
  {
    category: 'Bronze',
    levels: ['V', 'IV', 'III', 'II', 'I'],
    icon: Shield,
    color: 'from-orange-400 to-orange-700',
    baseMaxGain: 500,
    wagerPerLevel: 200,
    gamesGoalPerLevel: 5,
    rewardPerTier: 0,
    perks: ['Standard Support', 'Basic Multipliers']
  },
  {
    category: 'Silver',
    levels: ['V', 'IV', 'III', 'II', 'I'],
    icon: Medal,
    color: 'from-gray-300 to-gray-500',
    baseMaxGain: 1000,
    wagerPerLevel: 1000,
    gamesGoalPerLevel: 10,
    rewardPerTier: 100,
    perks: ['Increased Max Gain', 'Exclusive Badge']
  },
  {
    category: 'Gold',
    levels: ['V', 'IV', 'III', 'II', 'I'],
    icon: Star,
    color: 'from-yellow-400 to-yellow-600',
    baseMaxGain: 2500,
    wagerPerLevel: 5000,
    gamesGoalPerLevel: 25,
    rewardPerTier: 500,
    perks: ['Priority Support', 'Custom Avatar Border']
  },
  {
    category: 'Platinum',
    levels: ['V', 'IV', 'III', 'II', 'I'],
    icon: Zap,
    color: 'from-blue-400 to-blue-600',
    baseMaxGain: 5000,
    wagerPerLevel: 20000,
    gamesGoalPerLevel: 50,
    rewardPerTier: 2500,
    perks: ['VIP Lounge Access', 'Monthly Bonus']
  },
  {
    category: 'Diamond',
    levels: ['III', 'II', 'I'],
    icon: Crown,
    color: 'from-cyan-400 to-purple-600',
    baseMaxGain: 10000,
    wagerPerLevel: 250000,
    gamesGoalPerLevel: 100,
    rewardPerTier: 10000,
    perks: ['Personal VIP Host', 'Instant Withdrawals']
  }
];

const TOP_PLAYERS = [
  { rank: 1, name: 'CryptoKing', level: 84, league: 'Diamond', wagered: '1.2M', winRate: '56.2%' },
  { rank: 2, name: 'WhaleHunter', level: 79, league: 'Diamond', wagered: '980k', winRate: '54.8%' },
  { rank: 3, name: 'SatoshiFan', level: 72, league: 'Platinum', wagered: '450k', winRate: '58.1%' },
  { rank: 4, name: 'MoonBoy', level: 68, league: 'Platinum', wagered: '320k', winRate: '52.4%' },
  { rank: 5, name: 'DegenPro', level: 65, league: 'Gold', wagered: '180k', winRate: '55.0%' },
  { rank: 6, name: 'LuckySeven', level: 61, league: 'Gold', wagered: '140k', winRate: '53.9%' },
  { rank: 7, name: 'BlockMaster', level: 58, league: 'Silver', wagered: '95k', winRate: '51.2%' },
  { rank: 8, name: 'AlphaPlayer', level: 55, league: 'Silver', wagered: '70k', winRate: '54.5%' },
];

export default function Ranks() {
  const { league: currentLeague, wageredAmount, level } = useBalance();

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-display font-black tracking-tighter">
          LEAGUES & <span className="text-primary italic underline decoration-secondary/30 underline-offset-8">LEADERBOARD</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
          Climb the ranks by wagering COINS. Unlock higher <span className="text-white">Max Gains</span>, exclusive rewards, and VIP perks.
        </p>
      </div>

      {/* Current Progress Quick Look */}
      <div className="glass-panel p-8 rounded-3xl border-primary/20 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-2xl">
              <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Status</div>
              <div className="text-3xl font-display font-black">{currentLeague} League <span className="text-primary">Lvl {level}</span></div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md w-full space-y-3">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span>Next Rank Progress</span>
              <span className="text-white">{wageredAmount.toFixed(2)} COINS Wagered</span>
            </div>
            <div className="h-3 w-full bg-surface rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 shadow-[0_0_15px_rgba(255,42,95,0.4)]" 
                style={{ width: `${Math.min(100, (wageredAmount / 1000) * 100)}%` }} // Simplified for display
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Rank Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {RANKS_INFO.map((rank) => {
          const Icon = rank.icon;
          const isCurrentLeague = currentLeague.startsWith(rank.category);
          
          return (
            <div 
              key={rank.category} 
              className={`glass-panel rounded-3xl p-6 flex flex-col gap-6 transition-all duration-500 relative overflow-hidden group ${
                isCurrentLeague ? 'ring-2 ring-primary bg-primary/5 scale-105 z-10' : 'hover:bg-white/5 border-white/5'
              }`}
            >
              <div className="space-y-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rank.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold">{rank.category}</h3>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">League Category</div>
                </div>
              </div>

              {/* Sub-levels visualization */}
              <div className="flex gap-1.5 justify-between">
                {rank.levels.map(lv => {
                  const levelName = `${rank.category} ${lv}`;
                  const isLvCurrent = currentLeague === levelName;
                  return (
                    <div 
                      key={lv} 
                      className={`flex-1 h-8 rounded-md flex items-center justify-center text-[10px] font-black border transition-all ${
                        isLvCurrent ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(255,42,95,0.4)]' : 'bg-surface/50 border-white/5 text-gray-500'
                      }`}
                    >
                      {lv}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 flex-1">
                <div className="p-3 rounded-xl bg-surface/50 border border-white/5 space-y-1">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Base Max Gain</div>
                  <div className="font-mono font-bold text-success">+{rank.baseMaxGain} COINS</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface/50 border border-white/5 space-y-1">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Wager</div>
                    <div className="text-xs text-white font-bold">{rank.wagerPerLevel.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface/50 border border-white/5 space-y-1">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Matches</div>
                    <div className="text-xs text-white font-bold">{rank.gamesGoalPerLevel}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-primary">Leaping Reward</div>
                  <div className="text-sm font-black text-white">
                    {rank.rewardPerTier === 0 ? '---' : `+${rank.rewardPerTier.toLocaleString()} COINS`}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-3">Key Perks</div>
                  {rank.perks.map(perk => (
                    <div key={perk} className="flex items-start gap-2 text-[10px] text-gray-400 font-medium leading-tight">
                      <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Leaderboard */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-display font-black flex items-center gap-3">
            <Trophy className="w-8 h-8 text-warning" />
            GLOBAL <span className="text-secondary">LEADERBOARD</span>
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors">Weekly</button>
            <button className="px-4 py-2 rounded-lg bg-secondary/20 border border-secondary text-xs font-bold text-secondary">All Time</button>
          </div>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="p-6">Rank</th>
                <th className="p-6">Player</th>
                <th className="p-6">League</th>
                <th className="p-6">Level</th>
                <th className="p-6">Wagered</th>
                <th className="p-6 text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {TOP_PLAYERS.map((player) => (
                <tr key={player.rank} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                      player.rank === 1 ? 'bg-warning text-background shadow-[0_0_15px_rgba(255,190,0,0.4)]' :
                      player.rank === 2 ? 'bg-gray-400 text-background' :
                      player.rank === 3 ? 'bg-orange-600 text-background' : 'text-gray-500'
                    }`}>
                      #{player.rank}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="font-bold text-white group-hover:text-primary transition-colors">{player.name}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      player.league === 'Diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                      player.league === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {player.league}
                    </span>
                  </td>
                  <td className="p-6 font-mono text-gray-400">Lvl {player.level}</td>
                  <td className="p-6 font-mono font-bold text-white">{player.wagered} <span className="text-[10px] text-gray-500 uppercase">Coins</span></td>
                  <td className="p-6 text-right font-mono text-success">{player.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-6 bg-surface/30 text-center">
            <button className="text-primary hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
              Show More Rankings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
