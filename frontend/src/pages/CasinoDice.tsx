import { useState, useEffect, useCallback } from 'react';
import { Dice5, Trophy, RefreshCw, Play, Square, Zap } from 'lucide-react';

import { useBalance } from '../context/BalanceContext.tsx';

export default function CasinoDice() {
  const { balance, updateBalance, getMaxGain, recordWager, updateSessionStats } = useBalance();
  const [betAmount, setBetAmount] = useState<number>(10);

  // Auto-adjust bet amount if it exceeds balance
  useEffect(() => {
    if (betAmount > balance) {
      setBetAmount(Math.max(0, balance));
    }
  }, [balance, betAmount]);

  const [winChance, setWinChance] = useState<number>(49.25); // Default to 2x payout (98.5/2)
  const [multiplierInput, setMultiplierInput] = useState<string>('2.0000');
  const [rolling, setRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ result: number; won: boolean; profit: number } | null>(null);


  // Auto Mode State
  const [isAuto, setIsAuto] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoRollCount, setAutoRollCount] = useState<number>(0);
  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const [isFastMode, setIsFastMode] = useState(false);

  // Constants — defined before handleRoll so useCallback can reference them
  const HOUSE_EDGE = 1.5;
  const MAX_CHANCE = 95;
  const MIN_CHANCE = 2;
  const MAX_GAIN = getMaxGain();

  // Derived Values
  const multiplier = (100 - HOUSE_EDGE) / winChance;
  const potentialProfit = betAmount * multiplier - betAmount;
  const actualProfit = Math.min(potentialProfit, MAX_GAIN);
  const rollUnder = winChance;

  // Sync multiplier input when winChance changes from slider
  useEffect(() => {
    setMultiplierInput(multiplier.toFixed(4));
  }, [winChance, multiplier]);

  const handleMultiplierChange = (val: string) => {
    setMultiplierInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 1.0103) { // 98.5 / 97.5 ≈ 1.0103 for max 97.5% win chance
      const newChance = (100 - HOUSE_EDGE) / num;
      if (newChance >= MIN_CHANCE && newChance <= MAX_CHANCE) {
        setWinChance(newChance);
      }
    }
  };

  const handleRoll = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;

    setRolling(true);
    setLastRoll(null);
    updateBalance(-betAmount);
    recordWager(betAmount);

    const mult = (100 - HOUSE_EDGE) / winChance;
    const potProfit = betAmount * mult - betAmount;
    const actualPft = Math.min(potProfit, MAX_GAIN);

    setTimeout(() => {
      const result = parseFloat((Math.random() * 100).toFixed(2));
      const won = result < winChance;
      const profit = won ? actualPft : -betAmount;

      setRolling(false);
      setLastRoll({ result, won, profit });

      updateSessionStats(betAmount, profit, won);

      if (won) {
        updateBalance(actualPft + betAmount);
      }
    }, isFastMode ? 50 : 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betAmount, balance, winChance, isFastMode, MAX_GAIN]);

  // Auto Mode useEffect — depends on handleRoll, so must come AFTER it
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (autoRunning && !rolling) {
      if (autoRollCount > 0 && currentAutoCount >= autoRollCount) {
        setAutoRunning(false);
        return;
      }
      // Removed stop on profit/loss based on local stats since it requires global now, 
      // but auto roll count still works.
      // We will only rely on autoRollCount for now.

      timeout = setTimeout(() => {
        handleRoll();
        setCurrentAutoCount(prev => prev + 1);
      }, isFastMode ? 50 : 300);
    }
    return () => clearTimeout(timeout);
  }, [autoRunning, rolling, autoRollCount, currentAutoCount, stopOnProfit, stopOnLoss, isFastMode, handleRoll]);



  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
          <Dice5 className="w-8 h-8 text-secondary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-display font-bold">Provably Fair Dice</h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 1.5%</span>
          </div>
          <p className="text-gray-400 mt-1">Set your win chance and roll the dice.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* ... Control Panel ... */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            
            {/* Auto / Manual Toggle */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 flex bg-surface rounded-lg p-1 border border-white/10">
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
              <button 
                onClick={() => setIsFastMode(!isFastMode)}
                className={`p-2 rounded-lg border transition-all ${isFastMode ? 'bg-warning/20 border-warning text-warning' : 'bg-surface border-white/10 text-gray-500'}`}
                title="Fast Mode"
              >
                <Zap className={`w-5 h-5 ${isFastMode ? 'fill-current' : ''}`} />
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
                <span className="font-mono text-success font-bold">+{actualProfit.toFixed(2)} COINS</span>
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
              <div className="flex justify-between items-center bg-background/50 border border-white/5 rounded-xl p-3">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Potential Win</span>
                <span className="text-sm font-mono font-bold text-success">
                  +{(betAmount * multiplier).toFixed(2)} COINS
                </span>
              </div>

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
                    <input 
                      type="number"
                      step="0.01"
                      value={multiplierInput}
                      onChange={(e) => handleMultiplierChange(e.target.value)}
                      disabled={autoRunning || rolling}
                      className="w-full bg-transparent text-center text-xl font-mono font-bold text-white focus:outline-none"
                    />
                  </div>
                  <div className="bg-surface/50 rounded-xl p-4 border border-white/5 text-center flex flex-col justify-center">
                    <div className="flex justify-between items-center px-2 mb-1">
                      <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Roll Under</div>
                      <div className="text-[8px] text-warning font-bold uppercase">Max: {MAX_GAIN}</div>
                    </div>
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
        </div>
      </div>
      
    </div>
  );
}
