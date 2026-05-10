import { useState, useRef } from 'react';
import { useBalance } from '../context/BalanceContext';
import { Wallet, Coins, History, Trophy } from 'lucide-react';
import StatsFloater from '../components/StatsFloater.tsx';

const ROULETTE_NUMBERS = [
  { n: 0, color: 'green' },
  { n: 32, color: 'red' }, { n: 15, color: 'black' }, { n: 19, color: 'red' }, { n: 4, color: 'black' },
  { n: 21, color: 'red' }, { n: 2, color: 'black' }, { n: 25, color: 'red' }, { n: 17, color: 'black' },
  { n: 34, color: 'red' }, { n: 6, color: 'black' }, { n: 27, color: 'red' }, { n: 13, color: 'black' },
  { n: 36, color: 'red' }, { n: 11, color: 'black' }, { n: 30, color: 'red' }, { n: 8, color: 'black' },
  { n: 23, color: 'red' }, { n: 10, color: 'black' }, { n: 5, color: 'red' }, { n: 24, color: 'black' },
  { n: 16, color: 'red' }, { n: 33, color: 'black' }, { n: 1, color: 'red' }, { n: 20, color: 'black' },
  { n: 14, color: 'red' }, { n: 31, color: 'black' }, { n: 9, color: 'red' }, { n: 22, color: 'black' },
  { n: 18, color: 'red' }, { n: 29, color: 'black' }, { n: 7, color: 'red' }, { n: 28, color: 'black' },
  { n: 12, color: 'red' }, { n: 35, color: 'black' }, { n: 3, color: 'red' }, { n: 26, color: 'black' }
];

export default function Roulette() {
  const { balance, updateBalance, recordWager, getMaxGain } = useBalance();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betType, setBetType] = useState<'red' | 'black' | 'green' | 'even' | 'odd' | number>('red');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof ROULETTE_NUMBERS[0] | null>(null);
  const [history, setHistory] = useState<typeof ROULETTE_NUMBERS[0][]>([]);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });

  const handleBet = () => {
    if (betAmount > balance) return;
    if (isSpinning) return;

    updateBalance(-betAmount);
    recordWager(betAmount);
    setIsSpinning(true);

    const winningIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winningNumber = ROULETTE_NUMBERS[winningIndex];
    
    // Calculate rotation: 5 full spins (360 * 5) + angle for the number
    const numberAngle = (winningIndex / ROULETTE_NUMBERS.length) * 360;
    const extraSpins = 360 * 8;
    const newRotation = rotation + extraSpins + (360 - (rotation % 360)) - numberAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(winningNumber);
      setHistory(prev => [winningNumber, ...prev].slice(0, 10));

      let multiplier = 0;
      if (typeof betType === 'number') {
        if (winningNumber.n === betType) multiplier = 36;
      } else if (betType === 'red' && winningNumber.color === 'red') multiplier = 2;
      else if (betType === 'black' && winningNumber.color === 'black') multiplier = 2;
      else if (betType === 'green' && winningNumber.color === 'green') multiplier = 36;
      else if (betType === 'even' && winningNumber.n !== 0 && winningNumber.n % 2 === 0) multiplier = 2;
      else if (betType === 'odd' && winningNumber.n % 2 !== 0) multiplier = 2;

      if (multiplier > 0) {
        const winAmount = Math.min(betAmount * multiplier, getMaxGain());
        updateBalance(winAmount);
        setStats(prev => ({ ...prev, wins: prev.wins + 1, totalProfit: prev.totalProfit + (winAmount - betAmount) }));
      } else {
        setStats(prev => ({ ...prev, losses: prev.losses + 1, totalProfit: prev.totalProfit - betAmount }));
      }
    }, 5000);
  };

  const resetStats = () => setStats({ wins: 0, losses: 0, totalProfit: 0 });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold">Roulette <span className="text-primary text-xl">Casino</span></h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 2.7%</span>
          </div>
          <p className="text-gray-400 mt-2">European style roulette with instant multipliers.</p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-primary/20">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Your Balance</div>
            <div className="text-xl font-mono font-bold text-white">{balance.toFixed(2)} COINS</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Controls */}
        <div className="glass-panel p-8 rounded-3xl space-y-8 border-white/5 order-2 lg:order-1">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" /> Bet Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface border-2 border-white/5 rounded-2xl p-4 pl-12 font-mono font-bold text-xl focus:border-primary/50 transition-all outline-none"
              />
              <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map(amt => (
                <button 
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/5"
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" /> Selection
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['red', 'black', 'green'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setBetType(type)}
                  className={`py-4 rounded-2xl font-bold uppercase tracking-tighter transition-all border-2 ${
                    betType === type 
                      ? 'border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(255,42,95,0.3)]' 
                      : 'border-white/5 bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
              {(['even', 'odd'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setBetType(type)}
                  className={`py-4 rounded-2xl font-bold uppercase tracking-tighter transition-all border-2 ${
                    betType === type 
                      ? 'border-primary bg-primary/10 text-white' 
                      : 'border-white/5 bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
              <input
                type="number"
                placeholder="0-36"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 0 && val <= 36) setBetType(val);
                }}
                className={`p-4 rounded-2xl font-mono font-bold text-center bg-white/5 border-2 ${
                  typeof betType === 'number' ? 'border-primary text-white' : 'border-white/5 text-gray-500'
                } outline-none focus:border-primary/50`}
              />
            </div>
          </div>

          <button
            onClick={handleBet}
            disabled={isSpinning || betAmount <= 0 || betAmount > balance}
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {isSpinning ? 'SPINNING...' : 'PLACE BET'}
          </button>
        </div>

        {/* Center: The Wheel */}
        <div className="lg:col-span-2 flex flex-col items-center gap-12 order-1 lg:order-2">
          <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px]">
            {/* Indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
              <div className="w-8 h-10 bg-primary clip-triangle shadow-lg shadow-primary/50"></div>
            </div>
            
            {/* The Wheel */}
            <div 
              ref={wheelRef}
              className="w-full h-full rounded-full border-8 border-surface shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-[5000ms] ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${ROULETTE_NUMBERS.map((n, i) => {
                  const start = (i / ROULETTE_NUMBERS.length) * 360;
                  const end = ((i + 1) / ROULETTE_NUMBERS.length) * 360;
                  const color = n.color === 'red' ? '#ef4444' : n.color === 'black' ? '#18181b' : '#22c55e';
                  return `${color} ${start}deg ${end}deg`;
                }).join(', ')})`
              }}
            >
              <div className="absolute inset-4 rounded-full border border-white/10"></div>
              {ROULETTE_NUMBERS.map((n, i) => {
                const angle = (i / ROULETTE_NUMBERS.length) * 360 + (360 / ROULETTE_NUMBERS.length / 2);
                return (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 origin-bottom py-2 text-[10px] md:text-xs font-black text-white"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    {n.n}
                  </div>
                );
              })}
              {/* Inner Circle */}
              <div className="absolute inset-[25%] rounded-full bg-surface border-4 border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Result</div>
                  <div className={`text-5xl font-black ${
                    result?.color === 'red' ? 'text-danger' : result?.color === 'black' ? 'text-white' : 'text-success'
                  }`}>
                    {result ? result.n : '?'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="w-full glass-panel p-6 rounded-3xl border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                <History className="w-4 h-4" /> Recent Spins
              </div>
              <div className="text-[10px] text-gray-500">Last 10 results</div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {history.map((h, i) => (
                <div 
                  key={i}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 shrink-0 ${
                    h.color === 'red' ? 'bg-danger/20 border-danger/50 text-danger' : 
                    h.color === 'black' ? 'bg-white/5 border-white/20 text-white' : 
                    'bg-success/20 border-success/50 text-success'
                  }`}
                >
                  {h.n}
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
