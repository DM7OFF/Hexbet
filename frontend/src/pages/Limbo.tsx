import { useState } from 'react';
import { useBalance } from '../context/BalanceContext';
import { Wallet, Coins, History, AlertCircle, Zap } from 'lucide-react';
import StatsFloater from '../components/StatsFloater.tsx';

export default function Limbo() {
  const { balance, updateBalance, recordWager, getMaxGain } = useBalance();
  const [betInput, setBetInput] = useState<string>('10');
  const [targetInput, setTargetInput] = useState<string>('2.00');
  const betAmount = Number(betInput) || 0;
  const targetMultiplier = Math.max(0.01, Number(targetInput) || 0.01);
  const [resultMultiplier, setResultMultiplier] = useState<number>(1.0);
  const [gameState, setGameState] = useState<'idle' | 'rolling' | 'win' | 'lose'>('idle');
  const [history, setHistory] = useState<{ mult: number; win: boolean }[]>([]);
  const [profitHistory, setProfitHistory] = useState<number[]>([0]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });

  const playLimbo = () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (targetMultiplier < 1.01) return;
    
    setGameState('rolling');
    updateBalance(-betAmount);
    recordWager(betAmount);
    
    setTimeout(() => {
      // 1.5% house edge => 0.985 / Math.random()
      const newMult = Math.min(1000, Math.max(1.00, 0.985 / Math.random()));
      const isWin = newMult >= targetMultiplier;
      
      setResultMultiplier(newMult);
      setGameState(isWin ? 'win' : 'lose');
      setHistory(prev => [{ mult: newMult, win: isWin }, ...prev].slice(0, 15));
      
      if (isWin) {
        const winAmount = Math.min(betAmount * targetMultiplier, getMaxGain());
        updateBalance(winAmount);
        setStats(prev => {
          const newProfit = prev.totalProfit + (winAmount - betAmount);
          setProfitHistory(h => [...h, newProfit].slice(-50));
          return { ...prev, wins: prev.wins + 1, totalProfit: newProfit };
        });
      } else {
        setStats(prev => {
          const newProfit = prev.totalProfit - betAmount;
          setProfitHistory(h => [...h, newProfit].slice(-50));
          return { ...prev, losses: prev.losses + 1, totalProfit: newProfit };
        });
      }
    }, 100); // Super fast instant feeling
  };

  const resetStats = () => {
    setStats({ wins: 0, losses: 0, totalProfit: 0 });
    setProfitHistory([0]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold text-secondary">Limbo</h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 1.5%</span>
          </div>
          <p className="text-gray-400 mt-2">Target a multiplier and see if the roll goes higher!</p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-secondary/20">
          <div className="p-2 rounded-lg bg-secondary/10">
            <Wallet className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Your Balance</div>
            <div className="text-xl font-mono font-bold text-white">{balance.toFixed(2)} COINS</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Controls */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5 h-fit">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-secondary" /> Bet Amount
            </label>
            <input
              type="number"
              value={betInput}
              onChange={(e) => setBetInput(e.target.value)}
              onBlur={() => setBetInput(Math.max(0, Number(betInput) || 0).toFixed(2))}
              disabled={gameState === 'rolling'}
              className="w-full bg-surface border-2 border-white/5 rounded-2xl p-4 font-mono font-bold text-xl focus:border-secondary/50 transition-all outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" /> Target Multiplier
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onBlur={() => setTargetInput(Math.max(1.01, Number(targetInput) || 0).toFixed(2))}
                disabled={gameState === 'rolling'}
                className="w-full bg-surface border-2 border-white/5 rounded-2xl p-4 font-mono font-bold text-xl text-warning focus:border-warning/50 transition-all outline-none disabled:opacity-50 pl-10"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warning font-black">×</span>
            </div>
            <div className="text-xs text-gray-500 font-bold flex justify-between">
              <span>Win Chance: {((0.985 / targetMultiplier) * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <button
              onClick={playLimbo}
              disabled={betAmount <= 0 || betAmount > balance || targetMultiplier < 1.01 || gameState === 'rolling'}
              className="w-full py-8 rounded-2xl bg-gradient-to-br from-warning to-orange-600 text-white font-black text-2xl shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all border border-white/10"
            >
              PLAY
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" /> Live Statistics
            </div>
            <div className="h-24 w-full relative mt-2 border-b border-white/5 pb-2">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {(() => {
                  if (profitHistory.length < 2) return null;
                  const min = Math.min(...profitHistory);
                  const max = Math.max(...profitHistory);
                  const range = max - min === 0 ? 1 : max - min;
                  const points = profitHistory.map((p, i) => `${(i / (profitHistory.length - 1)) * 100},${100 - ((p - min) / range) * 100}`).join(' ');
                  return (
                    <>
                      {min < 0 && max > 0 && <line x1="0" y1={100 - ((0 - min) / range) * 100} x2="100" y2={100 - ((0 - min) / range) * 100} stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" strokeWidth="1" />}
                      <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-gray-400">Total Profit</span>
              <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)} COINS
              </span>
            </div>
          </div>
        </div>

        {/* Center: Result */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel h-[450px] rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border-white/5 bg-gradient-to-b from-surface to-black/20">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
              backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>

            <div className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-500 mb-8 relative z-10">
              TARGET: <span className="text-white">{targetMultiplier.toFixed(2)}x</span>
            </div>

            <div className="relative z-10 text-center">
              <div className={`text-8xl md:text-9xl font-black transition-all duration-300 ${
                gameState === 'win' ? 'text-success drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] scale-110' : 
                gameState === 'lose' ? 'text-danger drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] scale-90 opacity-70' : 
                'text-white'
              }`}>
                {resultMultiplier.toFixed(2)}x
              </div>
              
              <div className="mt-8 h-12 flex items-center justify-center">
                {gameState === 'win' && (
                  <div className="text-success font-mono font-bold text-2xl animate-in slide-in-from-bottom-4">
                    +{(betAmount * targetMultiplier).toFixed(2)} COINS
                  </div>
                )}
                {gameState === 'lose' && (
                  <div className="text-danger font-mono font-bold text-2xl animate-in slide-in-from-bottom-4">
                    -{betAmount.toFixed(2)} COINS
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 overflow-hidden">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              <History className="w-4 h-4" /> Game History
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {history.map((h, i) => (
                <div 
                  key={i}
                  className={`px-4 py-2 rounded-xl flex items-center justify-center font-bold text-sm border-2 shrink-0 ${
                    h.win ? 'bg-success/20 border-success/50 text-success' : 'bg-danger/20 border-danger/50 text-danger'
                  }`}
                >
                  {h.mult.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <StatsFloater stats={stats} onReset={resetStats} />
    </div>
  );
}
