import { useState } from 'react';
import { BarChart2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatsFloaterProps {
  stats: {
    wins: number;
    losses: number;
    totalProfit: number;
  };
  onReset?: () => void;
}

export default function StatsFloater({ stats, onReset }: StatsFloaterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-[264px] md:translate-x-0 z-40">
      <motion.div 
        layout
        className="glass-panel rounded-2xl overflow-hidden border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/[0.03]">
          <div className="flex items-center gap-2 px-1">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Live Stats</span>
          </div>
          <div className="flex items-center gap-1">
            {onReset && (
              <button 
                onClick={onReset}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                title="Reset Statistics"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 pt-3 overflow-hidden"
            >
              <div className="flex gap-6">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Profit</div>
                  <div className={`text-lg font-mono font-black ${stats.totalProfit > 0 ? 'text-success' : stats.totalProfit < 0 ? 'text-danger' : 'text-white'}`}>
                    {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
                  </div>
                </div>

                <div className="w-[1px] bg-white/[0.05] self-stretch"></div>

                <div className="flex gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Wins</div>
                    <div className="text-lg font-mono font-black text-success/80">{stats.wins}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Losses</div>
                    <div className="text-lg font-mono font-black text-danger/80">{stats.losses}</div>
                  </div>
                </div>
              </div>

              {/* Progress bar of win/loss ratio */}
              {(stats.wins > 0 || stats.losses > 0) && (
                <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-success/50" 
                    style={{ width: `${(stats.wins / (stats.wins + stats.losses)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-danger/50" 
                    style={{ width: `${(stats.losses / (stats.wins + stats.losses)) * 100}%` }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
