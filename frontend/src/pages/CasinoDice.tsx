import { useState, useEffect } from 'react';
import { Dice5, Trophy, RefreshCw, BarChart2, Play, Square } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CasinoDice() {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [winChance, setWinChance] = useState<number>(50);
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ result: number; won: boolean; profit: number } | null>(null);

  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });
  const [historyData, setHistoryData] = useState<{ roll: number; profit: number }[]>([{ roll: 0, profit: 0 }]);

  // Auto Mode State
  const [isAuto, setIsAuto] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoRollCount, setAutoRollCount] = useState<number>(0);
  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoRunning && !rolling) {
      if (autoRollCount > 0 && currentAutoCount >= autoRollCount) {
        setAutoRunning(false);
        return;
      }
      if (stopOnProfit > 0 && stats.totalProfit >= stopOnProfit) {
        setAutoRunning(false);
        return;
      }
      if (stopOnLoss > 0 && stats.totalProfit <= -stopOnLoss) {
        setAutoRunning(false);
        return;
      }

      timeout = setTimeout(() => {
        handleRoll();
        setCurrentAutoCount(prev => prev + 1);
      }, 300); // 300ms delay between auto rolls
    }
    return () => clearTimeout(timeout);
  }, [autoRunning, rolling, autoRollCount, currentAutoCount, stats.totalProfit, stopOnProfit, stopOnLoss]);

  // Constants
  const HOUSE_EDGE = 1; // 1%
  const MAX_CHANCE = 98;
  const MIN_CHANCE = 1;

  // Derived Values
  const multiplier = (100 - HOUSE_EDGE) / winChance;
  const profitOnWin = betAmount * multiplier - betAmount;
  const rollUnder = winChance;

  const handleRoll = () => {
    if (betAmount <= 0) return;
    
    setRolling(true);
    setLastRoll(null);

    // Simulate network delay and RNG
    setTimeout(() => {
      const result = parseFloat((Math.random() * 100).toFixed(2));
      const won = result < rollUnder;
      const profit = won ? profitOnWin : -betAmount;
      
      setLastRoll({
        result,
        won,
        profit
      });
      
      setStats(prev => ({
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        totalProfit: prev.totalProfit + profit
      }));
      
      setHistoryData(prev => [...prev, { roll: prev.length, profit: prev[prev.length - 1].profit + profit }]);
      
      setRolling(false);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <Dice5 className="w-8 h-8 text-secondary" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Provably Fair Dice</h2>
          <p className="text-gray-400">Set your win chance and roll the dice. 1% House Edge.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* ... Control Panel ... */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            
            {/* Auto / Manual Toggle */}
            <div className="flex bg-surface rounded-lg p-1 border border-white/10 mb-4">
              <button 
                onClick={() => setIsAuto(false)} 
                className={`flex-1 py-2 rounded text-sm font-bold transition-all ${!isAuto ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                Manual
              </button>
              <button 
                onClick={() => { setIsAuto(true); setAutoRunning(false); setCurrentAutoCount(0); }} 
                className={`flex-1 py-2 rounded text-sm font-bold transition-all ${isAuto ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                Auto
              </button>
            </div>

            {/* Bet Amount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Bet Amount</span>
                <span className="text-white font-bold">{betAmount.toFixed(2)} COINS</span>
              </div>
              <div className="flex bg-surface rounded-lg border border-white/10 overflow-hidden">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={autoRunning}
                  className="w-full bg-transparent p-3 text-white font-mono focus:outline-none disabled:opacity-50"
                  min="0"
                  step="1"
                />
                <button onClick={() => setBetAmount(prev => prev / 2)} disabled={autoRunning} className="px-3 hover:bg-white/5 text-sm font-bold text-gray-400 border-l border-white/10 transition-colors disabled:opacity-50">1/2</button>
                <button onClick={() => setBetAmount(prev => prev * 2)} disabled={autoRunning} className="px-3 hover:bg-white/5 text-sm font-bold text-gray-400 border-l border-white/10 transition-colors disabled:opacity-50">x2</button>
              </div>
            </div>

            {/* Profit on Win */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-medium">Profit on Win</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-success/20 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-success" />
                <span className="font-mono text-success font-bold">+{profitOnWin.toFixed(2)} COINS</span>
              </div>
            </div>

            {/* Auto Settings */}
            {isAuto && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-400 font-medium">Number of Rolls</span></div>
                  <input type="number" value={autoRollCount} onChange={e => setAutoRollCount(Number(e.target.value))} disabled={autoRunning} className="w-full bg-surface border border-white/10 p-2 rounded text-white font-mono focus:border-secondary outline-none disabled:opacity-50" placeholder="0 = infinite" />
                  <p className="text-xs text-gray-500 mt-1">0 for infinite</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400 font-medium">Stop on Profit</span></div>
                    <input type="number" value={stopOnProfit} onChange={e => setStopOnProfit(Number(e.target.value))} disabled={autoRunning} className="w-full bg-surface border border-white/10 p-2 rounded text-white font-mono focus:border-secondary outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400 font-medium">Stop on Loss</span></div>
                    <input type="number" value={stopOnLoss} onChange={e => setStopOnLoss(Number(e.target.value))} disabled={autoRunning} className="w-full bg-surface border border-white/10 p-2 rounded text-white font-mono focus:border-secondary outline-none disabled:opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {/* Roll Button */}
            {!isAuto ? (
              <button 
                onClick={handleRoll}
                disabled={rolling || betAmount <= 0}
                className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all duration-300 relative overflow-hidden ${
                  rolling 
                    ? 'bg-secondary/50 text-white/50 cursor-not-allowed' 
                    : 'btn-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)]'
                }`}
              >
                {rolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Rolling...
                  </span>
                ) : 'ROLL DICE'}
              </button>
            ) : (
              <button 
                onClick={() => {
                  if (autoRunning) {
                    setAutoRunning(false);
                  } else {
                    setCurrentAutoCount(0);
                    setAutoRunning(true);
                  }
                }}
                disabled={(!autoRunning && betAmount <= 0) || rolling}
                className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all duration-300 flex justify-center items-center gap-2 ${
                  autoRunning
                    ? 'bg-danger text-white shadow-[0_0_30px_rgba(255,50,50,0.3)] hover:bg-danger/80'
                    : 'btn-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)]'
                }`}
              >
                {autoRunning ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    STOP AUTO
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    START AUTO
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Game Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
              
              {/* Central Result Display */}
              <div className="text-center mb-12">
                <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Result</div>
                <div className={`text-8xl font-display font-black tracking-tighter transition-all duration-300 ${
                  lastRoll 
                    ? lastRoll.won ? 'text-success drop-shadow-[0_0_20px_rgba(0,255,100,0.5)] scale-110' : 'text-danger drop-shadow-[0_0_20px_rgba(255,50,50,0.5)] scale-95 opacity-80'
                    : 'text-white/20'
                }`}>
                  {rolling ? '...' : lastRoll ? lastRoll.result.toFixed(2) : '00.00'}
                </div>
                
                {lastRoll && !rolling && (
                  <div className={`mt-4 text-xl font-bold animate-in slide-in-from-bottom-4 ${lastRoll.won ? 'text-success' : 'text-danger'}`}>
                    {lastRoll.won ? `You Won +${lastRoll.profit.toFixed(2)} COINS!` : `You Lost ${betAmount.toFixed(2)} COINS`}
                  </div>
                )}
              </div>

              {/* Slider Area */}
              <div className="space-y-8 mt-auto">
                <div className="relative pt-6">
                  {/* Custom Track Background */}
                  <div className="absolute top-8 left-0 right-0 h-4 bg-surface rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-success/80 border-r-2 border-white"
                      style={{ width: `${winChance}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 bottom-0 right-0 bg-danger/80"
                      style={{ width: `${100 - winChance}%` }}
                    ></div>
                  </div>

                  {/* HTML Range Input */}
                  <input 
                    type="range" 
                    min={MIN_CHANCE} 
                    max={MAX_CHANCE} 
                    step="1"
                    value={winChance}
                    onChange={(e) => setWinChance(Number(e.target.value))}
                    className="w-full absolute top-7 opacity-0 cursor-pointer h-6"
                  />
                  
                  {/* Slider Thumb Visual (Controlled by State) */}
                  <div 
                    className="absolute top-5 w-8 h-10 bg-white rounded shadow-xl border-2 border-secondary flex flex-col items-center justify-center pointer-events-none transition-all"
                    style={{ left: `calc(${winChance}% - 16px)` }}
                  >
                    <div className="w-1 h-3 bg-secondary/50 rounded-full"></div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface/50 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Multiplier</div>
                    <div className="text-xl font-mono font-bold text-white">{multiplier.toFixed(4)}x</div>
                  </div>
                  <div className="bg-surface/50 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Roll Under</div>
                    <div className="text-xl font-mono font-bold text-success">{rollUnder.toFixed(2)}</div>
                  </div>
                  <div className="bg-surface/50 rounded-xl p-4 border border-white/5 text-center">
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Win Chance</div>
                    <div className="text-xl font-mono font-bold text-primary">{winChance.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Session Statistics Panel */}
          <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-bottom-4">
            <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2 text-gray-300">
              <BarChart2 className="w-5 h-5 text-secondary" />
              Session Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface/30 rounded-xl p-4 text-center border border-white/5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Wins</div>
                <div className="text-2xl font-mono font-bold text-success">{stats.wins}</div>
              </div>
              <div className="bg-surface/30 rounded-xl p-4 text-center border border-white/5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Losses</div>
                <div className="text-2xl font-mono font-bold text-danger">{stats.losses}</div>
              </div>
              <div className="bg-surface/30 rounded-xl p-4 text-center border border-white/5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Net Profit</div>
                <div className={`text-2xl font-mono font-bold ${stats.totalProfit > 0 ? 'text-success' : stats.totalProfit < 0 ? 'text-danger' : 'text-gray-400'}`}>
                  {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="glass-panel p-6 rounded-2xl animate-in slide-in-from-bottom-4 mt-6">
            <h3 className="font-bold font-display text-lg mb-4 flex items-center gap-2 text-gray-300">
              <BarChart2 className="w-5 h-5 text-secondary" />
              Profit History
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="roll" stroke="#ffffff33" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff33" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(0)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1b26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                    labelStyle={{ color: '#888' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#00f0ff" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
