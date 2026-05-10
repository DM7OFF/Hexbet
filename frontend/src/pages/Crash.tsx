import { useState, useEffect, useRef } from 'react';
import { useBalance } from '../context/BalanceContext';
import { Wallet, Coins, History, AlertCircle } from 'lucide-react';

export default function Crash() {
  const { balance, updateBalance, recordWager, getMaxGain } = useBalance();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed_out'>('idle');
  const [history, setHistory] = useState<number[]>([]);
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startNextGame = () => {
    if (betAmount > balance) return;
    
    updateBalance(-betAmount);
    recordWager(betAmount);
    
    setMultiplier(1.0);
    setCashoutAt(null);
    setGameState('running');
    
    const newCrashPoint = 1 + (Math.random() * (Math.random() < 0.1 ? 10 : 2.5));
    setCrashPoint(newCrashPoint);
    
    startTimeRef.current = Date.now();
    gameLoopRef.current = requestAnimationFrame(() => updateMultiplier());
  };

  const updateMultiplier = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const currentMult = Math.pow(1.1, elapsed * 2);
    
    if (currentMult >= crashPoint) {
      setGameState('crashed');
      setHistory(prev => [parseFloat(crashPoint.toFixed(2)), ...prev].slice(0, 15));
      cancelAnimationFrame(gameLoopRef.current!);
      return;
    }

    setMultiplier(currentMult);
    gameLoopRef.current = requestAnimationFrame(() => updateMultiplier());
  };

  const handleCashout = () => {
    if (gameState !== 'running') return;
    
    const currentMult = multiplier;
    setCashoutAt(currentMult);
    setGameState('cashed_out');
    
    const winAmount = Math.min(betAmount * currentMult, getMaxGain());
    updateBalance(winAmount);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold text-secondary">Crash <span className="text-gray-500 text-xl">Moon</span></h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 1%</span>
          </div>
          <p className="text-gray-400 mt-2">Cash out before the graph crashes to win!</p>
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
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
              disabled={gameState === 'running'}
              className="w-full bg-surface border-2 border-white/5 rounded-2xl p-4 font-mono font-bold text-xl focus:border-secondary/50 transition-all outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-4 pt-4">
            {gameState === 'running' ? (
              <button
                onClick={handleCashout}
                className="w-full py-8 rounded-2xl bg-secondary text-surface font-black text-2xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                CASHOUT<br/>
                <span className="text-sm opacity-70">{(betAmount * multiplier).toFixed(2)} COINS</span>
              </button>
            ) : (
              <button
                onClick={startNextGame}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full py-8 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 text-white font-black text-2xl shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all border border-white/10"
              >
                PLACE BET
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface/50 border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" /> Live Stats
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Potential Profit</span>
              <span className="text-success font-bold">+{(betAmount * multiplier - betAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center: Graph */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel h-[450px] rounded-3xl relative overflow-hidden flex items-center justify-center border-white/5 bg-gradient-to-b from-surface to-black/20">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
              backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>

            <div className="relative z-10 text-center">
              <div className={`text-8xl md:text-9xl font-black transition-all duration-75 ${
                gameState === 'crashed' ? 'text-danger scale-90' : 
                gameState === 'cashed_out' ? 'text-success' : 'text-white'
              }`}>
                {multiplier.toFixed(2)}x
              </div>
              {gameState === 'crashed' && (
                <div className="text-danger font-display font-bold text-2xl mt-4 animate-bounce">CRASHED!</div>
              )}
              {gameState === 'cashed_out' && (
                <div className="text-success font-display font-bold text-2xl mt-4">
                  CASHED OUT AT {cashoutAt?.toFixed(2)}x
                </div>
              )}
            </div>

            {/* Moving Line (Abstract) */}
            {gameState === 'running' && (
              <div className="absolute bottom-0 left-0 w-full h-full">
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-secondary shadow-[0_0_20px_rgba(0,240,255,0.8)] transition-all duration-75"
                  style={{ 
                    width: `${Math.min(100, (multiplier - 1) * 20)}%`,
                    transform: `rotate(-${Math.min(45, (multiplier - 1) * 10)}deg)`,
                    transformOrigin: 'bottom left'
                  }}
                ></div>
              </div>
            )}
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
                    h >= 2.0 ? 'bg-success/20 border-success/50 text-success' : 
                    h >= 1.2 ? 'bg-secondary/20 border-secondary/50 text-secondary' :
                    'bg-danger/20 border-danger/50 text-danger'
                  }`}
                >
                  {h.toFixed(2)}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
