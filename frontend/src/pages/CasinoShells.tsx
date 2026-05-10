import { useState, useEffect } from 'react';
import { Trophy, BarChart2, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const HOUSE_EDGE = 3.0; // Increased house edge to lower multipliers and increase casino profit

export default function CasinoShells() {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [cupsCount, setCupsCount] = useState<number>(3);
  const [gameState, setGameState] = useState<'idle' | 'shuffling' | 'picking' | 'revealing'>('idle');
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cups, setCups] = useState<number[]>([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, totalProfit: 0 });
  const [historyData, setHistoryData] = useState<{ roll: number; profit: number }[]>([{ roll: 0, profit: 0 }]);

  const multiplier = cupsCount * (1 - HOUSE_EDGE / 100);
  const potentialProfit = betAmount * multiplier - betAmount;

  useEffect(() => {
    setCups(Array.from({ length: cupsCount }, (_, i) => i));
  }, [cupsCount]);

  const startShuffle = () => {
    if (betAmount <= 0) return;
    setGameState('shuffling');
    setWinningIndex(null);
    setSelectedIndex(null);

    // Shuffle logic with extra randomization to ensure no bias
    setTimeout(() => {
      // Use a more robust randomization approach
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      const realWinningIndex = randomValues[0] % cupsCount;
      
      setWinningIndex(realWinningIndex);
      setGameState('picking');
    }, 2000);
  };

  const handlePick = (index: number) => {
    if (gameState !== 'picking') return;
    setSelectedIndex(index);
    setGameState('revealing');

    const won = index === winningIndex;
    const profit = won ? potentialProfit : -betAmount;

    setTimeout(() => {
      setStats(prev => ({
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        totalProfit: prev.totalProfit + profit
      }));
      setHistoryData(prev => [...prev, { roll: prev.length, profit: prev[prev.length - 1].profit + profit }]);
    }, 500);
  };

  const reset = () => {
    setGameState('idle');
    setWinningIndex(null);
    setSelectedIndex(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold">Shell Game</h2>
          <p className="text-gray-400">Find the ball under the cups. {HOUSE_EDGE}% House Edge.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bet Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameState !== 'idle' && gameState !== 'revealing'}
                className="w-full bg-surface border border-white/10 p-3 rounded-lg text-white font-mono focus:border-primary outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Number of Cups</label>
              <div className="grid grid-cols-2 gap-2">
                {[3, 4, 5, 6].map(n => (
                  <button
                    key={n}
                    onClick={() => setCupsCount(n)}
                    disabled={gameState !== 'idle' && gameState !== 'revealing'}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      cupsCount === n ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/5 text-gray-400'
                    } disabled:opacity-50`}
                  >
                    {n} Cups
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-surface/50 rounded-xl border border-white/5 space-y-1">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Potential Win</div>
              <div className="text-xl font-mono font-bold text-success">{(betAmount * multiplier).toFixed(2)} COINS</div>
              <div className="text-xs text-gray-400">{multiplier.toFixed(2)}x Multiplier</div>
            </div>

            {gameState === 'idle' || gameState === 'revealing' ? (
              <button 
                onClick={gameState === 'revealing' ? reset : startShuffle}
                className="btn-primary w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(255,42,95,0.3)]"
              >
                {gameState === 'revealing' ? 'PLAY AGAIN' : 'SHUFFLE & START'}
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl bg-white/5 text-center font-bold text-gray-500 flex items-center justify-center gap-2">
                {gameState === 'shuffling' ? <><RefreshCw className="w-5 h-5 animate-spin" /> Shuffling...</> : 'Pick a cup!'}
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-12 rounded-3xl min-h-[400px] flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(255,42,95,0.05),transparent)]">
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 w-full max-w-3xl">
              {cups.map((id) => (
                <motion.div
                  key={id}
                  layout
                  onClick={() => handlePick(id)}
                  className={`relative w-24 h-32 md:w-32 md:h-40 cursor-pointer group ${gameState !== 'picking' ? 'cursor-default' : ''}`}
                >
                  {/* The Cup */}
                  <motion.div
                    animate={{
                      y: (gameState === 'revealing' && (id === winningIndex || id === selectedIndex)) ? -60 : 0,
                      rotate: gameState === 'shuffling' ? [0, -5, 5, 0] : 0
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 0.2 },
                      y: { type: 'spring', stiffness: 300, damping: 20 }
                    }}
                    className={`absolute inset-0 bg-gradient-to-b from-primary/80 to-primary rounded-t-[40%] rounded-b-lg shadow-xl z-20 flex items-center justify-center border-t border-white/20 overflow-hidden ${
                      gameState === 'revealing' && id === winningIndex ? 'ring-4 ring-success ring-offset-4 ring-offset-background' : ''
                    }`}
                  >
                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]"></div>
                    <Trophy className={`absolute w-12 h-12 text-white/20 transition-transform duration-500 ${gameState === 'picking' ? 'group-hover:scale-110' : ''}`} />
                  </motion.div>

                  {/* The Ball (only visible when revealing) */}
                  <AnimatePresence>
                    {gameState === 'revealing' && id === winningIndex && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_white] z-10"
                      >
                        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,#fff,#ddd)] rounded-full"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pick indicator */}
                  {selectedIndex === id && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-primary uppercase">Your Pick</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Game Overlay Messages */}
            <AnimatePresence>
              {gameState === 'revealing' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
                >
                  <div className={`text-4xl font-display font-black italic tracking-tighter ${selectedIndex === winningIndex ? 'text-success' : 'text-danger'}`}>
                    {selectedIndex === winningIndex ? 'JACKPOT!' : 'EMPTY...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-bold flex items-center gap-2 text-gray-300 mb-4">
                <BarChart2 className="w-5 h-5 text-primary" /> Session Stats
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-surface/30 border border-white/5">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Wins</div>
                  <div className="text-xl font-mono font-bold text-success">{stats.wins}</div>
                </div>
                <div className="p-3 rounded-xl bg-surface/30 border border-white/5">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Losses</div>
                  <div className="text-xl font-mono font-bold text-danger">{stats.losses}</div>
                </div>
                <div className="p-3 rounded-xl bg-surface/30 border border-white/5">
                  <div className="text-[10px] text-gray-500 font-bold uppercase">Profit</div>
                  <div className={`text-xl font-mono font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stats.totalProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorProfitShells" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff2a5f" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#ff2a5f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis hide dataKey="roll" />
                  <YAxis hide />
                  <Area type="monotone" dataKey="profit" stroke="#ff2a5f" fill="url(#colorProfitShells)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
