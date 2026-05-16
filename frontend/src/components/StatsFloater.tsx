import { useState, useEffect } from 'react';
import { BarChart2, ChevronDown, ChevronUp, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBalance } from '../context/BalanceContext';

export default function StatsFloater() {
  const { sessionStats, resetSessionStats, isStatsFloaterOpen, setStatsFloaterOpen } = useBalance();
  const [isExpanded, setIsExpanded] = useState(true);
  const [profitHistory, setProfitHistory] = useState<number[]>([0]);

  useEffect(() => {
    setProfitHistory(prev => {
      if (sessionStats.wins === 0 && sessionStats.losses === 0) return [0];
      return [...prev, sessionStats.totalProfit].slice(-50);
    });
  }, [sessionStats.wins, sessionStats.losses, sessionStats.totalProfit]);

  const graphColor = sessionStats.totalProfit >= 0 ? '#22c55e' : '#ef4444';

  return (
    <AnimatePresence>
      {isStatsFloaterOpen && (
        <motion.div 
          drag
          dragMomentum={false}
          className="fixed top-24 right-6 z-50 w-80 cursor-move"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="glass-panel rounded-2xl overflow-hidden border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-surface/90 backdrop-blur-xl">
            <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/[0.03]">
              <div className="flex items-center gap-2 px-1 pointer-events-none">
                <BarChart2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Stats</span>
              </div>
              <div className="flex items-center gap-1 cursor-default" onPointerDownCapture={e => e.stopPropagation()}>
                <button 
                  onClick={resetSessionStats}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors cursor-pointer"
                  title="Reset Statistics"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setStatsFloaterOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-danger transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-5 pt-4 overflow-hidden cursor-default"
                  onPointerDownCapture={e => e.stopPropagation()}
                >
                  <div className="flex gap-6 mb-4">
                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Profit</div>
                      <div className={`text-xl font-mono font-black ${sessionStats.totalProfit > 0 ? 'text-success' : sessionStats.totalProfit < 0 ? 'text-danger' : 'text-white'}`}>
                        {sessionStats.totalProfit > 0 ? '+' : ''}{sessionStats.totalProfit.toFixed(2)}
                      </div>
                    </div>

                    <div className="w-[1px] bg-white/[0.05] self-stretch"></div>

                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Wagered</div>
                      <div className="text-xl font-mono font-black text-white">{sessionStats.wagered.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Wins</span>
                      <span className="font-mono font-black text-success/80 text-lg">{sessionStats.wins}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Losses</span>
                      <span className="font-mono font-black text-danger/80 text-lg">{sessionStats.losses}</span>
                    </div>
                  </div>

                  {/* Progress bar of win/loss ratio */}
                  {(sessionStats.wins > 0 || sessionStats.losses > 0) && (
                    <>
                      <div className="mt-5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter mb-1.5">
                        <span>Win Rate</span>
                        <span className="text-white">{((sessionStats.wins / (sessionStats.wins + sessionStats.losses)) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-success/50" 
                          style={{ width: `${(sessionStats.wins / (sessionStats.wins + sessionStats.losses)) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-danger/50" 
                          style={{ width: `${(sessionStats.losses / (sessionStats.wins + sessionStats.losses)) * 100}%` }}
                        />
                      </div>
                    </>
                  )}

                  {/* SVG Graph */}
                  {profitHistory.length > 0 && (
                    <div className="mt-5 h-24 w-full relative border-t border-white/5 pt-4">
                       <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                          {(() => {
                            const min = Math.min(...profitHistory);
                            const max = Math.max(...profitHistory);
                            const range = max - min === 0 ? 1 : max - min;
                            const points = profitHistory.map((p, i) => {
                              const x = (i / Math.max(1, profitHistory.length - 1)) * 100;
                              const y = 100 - ((p - min) / range) * 100;
                              return `${x},${y}`;
                            }).join(' ');
                            return (
                              <>
                                {min < 0 && max > 0 && <line x1="0" y1={100 - ((0 - min) / range) * 100} x2="100" y2={100 - ((0 - min) / range) * 100} stroke="rgba(255,255,255,0.2)" strokeDasharray="2 2" strokeWidth="1" />}
                                <polyline points={points} fill="none" stroke={graphColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </>
                            );
                          })()}
                       </svg>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
