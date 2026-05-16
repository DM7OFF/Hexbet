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
                  <div className="flex gap-6 mb-6">
                    <div className="space-y-0.5 flex-1">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Net Profit</div>
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

                  <div className="flex justify-between items-center text-sm bg-surface/50 p-3 rounded-xl border border-white/5 mb-6">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Wins</span>
                      <span className="font-mono font-black text-white text-lg">{sessionStats.wins}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Losses</span>
                      <span className="font-mono font-black text-white text-lg">{sessionStats.losses}</span>
                    </div>
                  </div>

                  {/* SVG Graph with Y/X axes */}
                  {profitHistory.length > 0 && (
                    <div className="mt-2 h-32 w-full relative">
                      <div className="absolute inset-0 flex">
                        {/* Y-axis Labels */}
                        <div className="w-12 h-full flex flex-col justify-between text-[8px] font-mono text-gray-500 pr-2 pb-4 pt-1 text-right">
                          <span>{Math.max(...profitHistory).toFixed(0)}</span>
                          <span>{((Math.max(...profitHistory) + Math.min(...profitHistory)) / 2).toFixed(0)}</span>
                          <span>{Math.min(...profitHistory).toFixed(0)}</span>
                        </div>
                        
                        {/* Graph Area */}
                        <div className="flex-1 relative border-l border-b border-white/10 pb-4">
                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible absolute inset-0">
                            {(() => {
                              const min = Math.min(...profitHistory);
                              const max = Math.max(...profitHistory);
                              const range = max - min === 0 ? 1 : max - min;
                              const zeroY = 100 - ((0 - min) / range) * 100;
                              const points = profitHistory.map((p, i) => {
                                const x = (i / Math.max(1, profitHistory.length - 1)) * 100;
                                const y = 100 - ((p - min) / range) * 100;
                                return `${x},${y}`;
                              }).join(' ');
                              
                              return (
                                <>
                                  <defs>
                                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="100%">
                                      <stop offset="0%" stopColor="#22c55e" />
                                      <stop offset={`${Math.max(0, Math.min(100, zeroY))}%`} stopColor="#22c55e" />
                                      <stop offset={`${Math.max(0, Math.min(100, zeroY))}%`} stopColor="#ef4444" />
                                      <stop offset="100%" stopColor="#ef4444" />
                                    </linearGradient>
                                  </defs>
                                  {min < 0 && max > 0 && <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="rgba(255,255,255,0.1)" strokeDasharray="2 2" strokeWidth="1" />}
                                  <polyline points={points} fill="none" stroke="url(#profitGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </>
                              );
                            })()}
                          </svg>
                          
                          {/* X-axis indicators */}
                          <div className="absolute -bottom-4 left-0 right-0 flex justify-between text-[8px] font-mono text-gray-500">
                            <span>0</span>
                            <span>Bets</span>
                            <span>{profitHistory.length}</span>
                          </div>
                        </div>
                      </div>
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
