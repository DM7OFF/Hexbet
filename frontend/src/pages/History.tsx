import { useState } from 'react';
import { useBalance } from '../context/BalanceContext';
import { History as HistoryIcon, Search, Trash2, Trophy, Coins, TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function History() {
  const { history, clearHistory } = useBalance();
  const [searchGame, setSearchGame] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'bigWins' | 'lucky'>('all');

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.game.toLowerCase().includes(searchGame.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    if (activeTab === 'bigWins') {
      return matchesSearch && matchesStatus && item.profit >= 100;
    }
    if (activeTab === 'lucky') {
      return matchesSearch && matchesStatus && item.multiplier >= 5.0;
    }
    return matchesSearch && matchesStatus;
  });

  // Calculate high-level stats
  const totalWagered = history.reduce((sum, item) => sum + item.wager, 0);
  const totalProfit = history.reduce((sum, item) => sum + item.profit, 0);
  const highestWin = history.reduce((max, item) => item.profit > max ? item.profit : max, 0);
  const highestMult = history.reduce((max, item) => item.multiplier > max ? item.multiplier : max, 0);
  const winCount = history.filter(item => item.status === 'win').length;
  const winRate = history.length > 0 ? (winCount / history.length) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold flex items-center gap-3">
              <HistoryIcon className="w-10 h-10 text-primary" />
              Game <span className="text-primary">History</span>
            </h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Live Auditing</span>
          </div>
          <p className="text-gray-400 mt-2">Browse through your complete single-player wager ledger and verify fair payouts.</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-danger/10 hover:bg-danger/25 border border-danger/30 text-danger rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
          >
            <Trash2 className="w-4 h-4" /> Clear Ledger
          </button>
        )}
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-card/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
            <span>Total Wagered</span>
            <Coins className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{totalWagered.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500 font-bold">{history.length} games logged</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-card/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
            <span>Net Profit</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className={`text-2xl font-mono font-black ${totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-500 font-bold">Win Rate: {winRate.toFixed(1)}%</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-card/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
            <span>Biggest Payout</span>
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-black text-white">+{highestWin.toFixed(2)}</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-primary">Coins</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-card/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
            <span>Peak Multiplier</span>
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-mono font-black text-white">{highestMult.toFixed(2)}x</div>
          <div className="text-[10px] text-gray-500 font-bold">Max potential achieved</div>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        {/* Tabs */}
        <div className="flex bg-surface rounded-xl p-1 border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Bets
          </button>
          <button
            onClick={() => setActiveTab('bigWins')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bigWins' ? 'bg-success/15 text-success shadow-sm' : 'text-gray-400 hover:text-success'
            }`}
          >
            <Trophy className="w-3 h-3" /> Big Wins (&gt;100)
          </button>
          <button
            onClick={() => setActiveTab('lucky')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lucky' ? 'bg-secondary/15 text-secondary shadow-sm' : 'text-gray-400 hover:text-secondary'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Lucky Bets (&gt;5x)
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by game name..."
              value={searchGame}
              onChange={(e) => setSearchGame(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 w-full md:w-48 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-8 pr-6 py-2 bg-surface border border-white/10 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all appearance-none"
            >
              <option value="all">All Outcomes</option>
              <option value="win">Wins Only</option>
              <option value="loss">Losses Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bets Ledger */}
      <div className="glass-panel rounded-3xl overflow-hidden border-white/5 bg-card/10">
        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-gray-500 space-y-4">
            <HistoryIcon className="w-12 h-12 text-gray-600 mx-auto" />
            <div>
              <h4 className="font-bold text-white text-lg">No Matching Bets Found</h4>
              <p className="text-sm mt-1">Play a couple of rounds on any Casino game to populate your local ledger.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface/50 text-gray-400 text-[10px] font-black uppercase tracking-wider border-b border-b-white/5">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Game</th>
                  <th className="p-4">Wager</th>
                  <th className="p-4">Payout</th>
                  <th className="p-4">Profit</th>
                  <th className="p-4">Multiplier</th>
                  <th className="p-4">Outcome</th>
                  <th className="p-4 pr-6 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 font-mono text-gray-500 text-xs">{item.id}</td>
                    <td className="p-4 text-white font-display">{item.game}</td>
                    <td className="p-4 font-mono text-gray-300">{item.wager.toFixed(2)}</td>
                    <td className="p-4 font-mono text-gray-300">{item.payout.toFixed(2)}</td>
                    <td className="p-4 font-mono">
                      <span className={item.profit > 0 ? 'text-success' : item.profit < 0 ? 'text-danger' : 'text-gray-400'}>
                        {item.profit > 0 ? '+' : ''}{item.profit.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">{item.multiplier.toFixed(2)}x</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        item.status === 'win' ? 'bg-success/15 border-success/30 text-success' :
                        item.status === 'draw' ? 'bg-white/10 border-white/20 text-white' :
                        'bg-danger/15 border-danger/30 text-danger'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-gray-500 text-xs font-mono">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
