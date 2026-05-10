import { useState, useEffect, useRef } from 'react';
import { Coins, BarChart2, Play, Square, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Data ---

const MULTIPLIERS: Record<number, Record<string, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    med: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29]
  },
  12: {
    low: [10, 5, 2, 1.1, 1, 0.5, 0.3, 0.5, 1, 1.1, 2, 5, 10],
    med: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170]
  },
  16: {
    low: [16, 9, 2, 1.4, 1.2, 1.1, 1, 0.5, 0.2, 0.5, 1, 1.1, 1.2, 1.4, 2, 9, 16],
    med: [110, 25, 10, 5, 2, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 2, 5, 10, 25, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
  }
};

interface Ball {
  id: string;
  path: { x: number; y: number }[];
  payout: number;
  multiplier: number;
}

import { useBalance } from '../context/BalanceContext.tsx';
import StatsFloater from '../components/StatsFloater.tsx';

export default function CasinoPlinko() {
  const { balance, updateBalance, getMaxGain, recordWager } = useBalance();
  const [betAmount, setBetAmount] = useState<number>(10);
  const MAX_GAIN = getMaxGain();

  // Auto-adjust bet amount if it exceeds balance
  useEffect(() => {
    if (betAmount > balance) {
      setBetAmount(Math.max(0, balance));
    }
  }, [balance, betAmount]);

  const [rows, setRows] = useState<number>(8);
  const [risk, setRisk] = useState<'low' | 'med' | 'high'>('med');
  const [balls, setBalls] = useState<Ball[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });
  
  const resetStats = () => {
    setStats({ wins: 0, losses: 0, totalProfit: 0 });
  };
  const [historyData, setHistoryData] = useState<{ roll: number; profit: number }[]>([{ roll: 0, profit: 0 }]);
  
  // Auto Mode
  const [isAuto, setIsAuto] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const autoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const multipliers = MULTIPLIERS[rows][risk];

  const handleDrop = () => {
    if (betAmount <= 0 || betAmount > balance) return;

    const ballId = Math.random().toString(36).substr(2, 9);
    updateBalance(-betAmount); // Deduct stake
    recordWager(betAmount); // Track progression
    
    // Generate Path
    let currentIndex = 0;
    const path = [{ x: 0, y: 0 }];
    
    for (let i = 1; i <= rows; i++) {
      const direction = Math.random() < 0.5 ? -0.5 : 0.5;
      currentIndex += direction + 0.5;
      path.push({
        x: currentIndex - i / 2,
        y: i
      });
    }

    // Final bucket index
    const bucketIndex = Math.round(currentIndex);
    const multiplier = multipliers[bucketIndex];
    const payout = betAmount * multiplier;
    const profit = Math.min(payout - betAmount, MAX_GAIN);
    const actualPayout = betAmount + profit;

    const newBall: Ball = {
      id: ballId,
      path: path.map((p, i) => ({
        x: 50 + p.x * (100 / (rows + 2)),
        y: 5 + (i * (85 / rows))
      })),
      payout: actualPayout,
      multiplier
    };

    setBalls(prev => [...prev, newBall]);

    // Update stats after animation
    setTimeout(() => {
      updateBalance(actualPayout); // Add payout to global balance

      setStats(prev => ({
        wins: prev.wins + (multiplier > 1 ? 1 : 0),
        losses: prev.losses + (multiplier <= 1 ? 1 : 0),
        totalProfit: prev.totalProfit + profit
      }));
      setHistoryData(prev => [...prev, { roll: prev.length, profit: prev[prev.length - 1].profit + profit }]);
      setBalls(prev => prev.filter(b => b.id !== ballId));
    }, isFastMode ? 400 : 3000); // 400ms in fast mode vs 3s
  };

  useEffect(() => {
    if (autoRunning) {
      autoTimeoutRef.current = setTimeout(() => {
        handleDrop();
      }, isFastMode ? 100 : 500);
    } else if (autoTimeoutRef.current) {
      clearTimeout(autoTimeoutRef.current);
    }
    return () => {
      if (autoTimeoutRef.current) clearTimeout(autoTimeoutRef.current);
    };
  }, [autoRunning, balls.length, isFastMode]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <Coins className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-display font-bold">Plinko</h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 1.5%</span>
          </div>
          <p className="text-gray-400 mt-1">Drop the ball and multiply your coins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex bg-surface rounded-lg p-1 border border-white/10">
                <button onClick={() => setIsAuto(false)} className={`flex-1 py-2 rounded text-sm font-bold transition-all ${!isAuto ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400'}`}>Manual</button>
                <button onClick={() => setIsAuto(true)} className={`flex-1 py-2 rounded text-sm font-bold transition-all ${isAuto ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400'}`}>Auto</button>
              </div>
              <button 
                onClick={() => setIsFastMode(!isFastMode)}
                className={`p-2 rounded-lg border transition-all ${isFastMode ? 'bg-warning/20 border-warning text-warning' : 'bg-surface border-white/10 text-gray-500'}`}
                title="Fast Mode"
              >
                <Zap className={`w-5 h-5 ${isFastMode ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bet Amount</label>
                <span className="text-[10px] text-warning font-bold uppercase tracking-wider">Max Gain: {MAX_GAIN}</span>
              </div>
              <div className="flex bg-surface rounded-lg border border-white/10 overflow-hidden">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full bg-transparent p-3 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Risk</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'med', 'high'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r as any)}
                    className={`py-2 rounded-lg text-xs font-bold capitalize border transition-all ${
                      risk === r ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-surface border-white/5 text-gray-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rows</label>
              <select
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white outline-none focus:border-secondary"
              >
                {[8, 12, 16].map(n => <option key={n} value={n}>{n} Rows</option>)}
              </select>
            </div>

            {!isAuto ? (
              <button onClick={handleDrop} className="btn-secondary w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                BET
              </button>
            ) : (
              <button 
                onClick={() => setAutoRunning(!autoRunning)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${autoRunning ? 'bg-danger text-white' : 'btn-secondary shadow-[0_0_30px_rgba(0,240,255,0.3)]'}`}
              >
                {autoRunning ? <><Square className="w-5 h-5 fill-current" /> STOP AUTO</> : <><Play className="w-5 h-5 fill-current" /> START AUTO</>}
              </button>
            )}
          </div>
        </div>

        {/* Board */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-4 rounded-3xl relative min-h-[600px] flex flex-col items-center justify-between bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.05),transparent)]">
            
            {/* Board SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full max-h-[500px]">
              {/* Pins */}
              {Array.from({ length: rows + 1 }).map((_, r) => (
                Array.from({ length: r + 1 }).map((_, i) => (
                  <circle
                    key={`${r}-${i}`}
                    cx={50 + (i - r / 2) * (100 / (rows + 2))}
                    cy={5 + (r * (85 / rows))}
                    r={0.6}
                    fill="#ffffff33"
                  />
                ))
              ))}

              {/* Falling Balls */}
              <AnimatePresence>
                {balls.map((ball) => (
                  <motion.circle
                    key={ball.id}
                    r={1.2}
                    fill="#00f0ff"
                    filter="drop-shadow(0 0 5px #00f0ff)"
                    animate={{
                      cx: ball.path.map(p => p.x),
                      cy: ball.path.map(p => p.y)
                    }}
                    transition={{
                      duration: isFastMode ? 0.4 : 3,
                      ease: "linear",
                      times: ball.path.map((_, i) => i / ball.path.length)
                    }}
                  />
                ))}
              </AnimatePresence>
            </svg>

            {/* Multipliers */}
            <div className="flex gap-1 w-full justify-center px-4 mb-4">
              {multipliers.map((m, i) => (
                <div 
                  key={i}
                  className={`flex-1 py-2 text-[10px] font-black text-center rounded transition-all duration-300 ${
                    m >= 2 ? 'bg-success/20 text-success border border-success/30' :
                    m >= 1 ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                    'bg-white/5 text-gray-500 border border-white/5'
                  }`}
                  style={{ minWidth: '0' }}
                >
                  {m}x
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
