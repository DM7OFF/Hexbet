import { useState } from 'react';
import { Bomb, Gem, Trophy, AlertCircle } from 'lucide-react';
import { useBalance } from '../context/BalanceContext.tsx';

type GameState = 'betting' | 'playing' | 'ended';

interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}

export default function Mines() {
  const { balance, updateBalance, recordWager, updateSessionStats } = useBalance();
  
  const [betAmount, setBetAmount] = useState<number>(10);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameState, setGameState] = useState<GameState>('betting');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);

  const HOUSE_EDGE = 0.015; // 1.5%

  // Pre-calculate multipliers for the current mine count
  const getMultiplier = (diamondsFound: number) => {
    if (diamondsFound === 0) return 1;
    
    // Formula: (Total! / (Total - Found)!) / ((Total - Mines)! / (Total - Mines - Found)!)
    // Simplified iteratively: Mult(k) = Mult(k-1) * (Total - (k-1)) / (Total - Mines - (k-1))
    let mult = 1;
    for (let i = 0; i < diamondsFound; i++) {
      mult *= (25 - i) / (25 - mineCount - i);
    }
    
    return mult * (1 - HOUSE_EDGE);
  };

  const currentMultiplier = getMultiplier(revealedCount);
  const nextMultiplier = getMultiplier(revealedCount + 1);
  const potentialProfit = (betAmount * currentMultiplier) - betAmount;

  // Initialize board
  const startNewGame = () => {
    if (betAmount > balance || betAmount <= 0) return;

    updateBalance(-betAmount);
    recordWager(betAmount);
    
    // Generate mines
    const newTiles: Tile[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      isMine: false,
      isRevealed: false
    }));

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const idx = Math.floor(Math.random() * 25);
      if (!newTiles[idx].isMine) {
        newTiles[idx].isMine = true;
        minesPlaced++;
      }
    }

    setTiles(newTiles);
    setRevealedCount(0);
    setGameState('playing');
    setLastResult(null);
  };

  const handleTileClick = (id: number) => {
    if (gameState !== 'playing') return;
    const tile = tiles[id];
    if (tile.isRevealed) return;

    const newTiles = [...tiles];
    newTiles[id].isRevealed = true;
    setTiles(newTiles);

    if (tile.isMine) {
      // LOSE
      setGameState('ended');
      setLastResult('loss');
      updateSessionStats(betAmount, -betAmount, false);
      // Reveal all mines
      setTiles(prev => prev.map(t => t.isMine ? { ...t, isRevealed: true } : t));
    } else {
      // SAFE
      const newCount = revealedCount + 1;
      setRevealedCount(newCount);
      
      // Auto cashout if all safe tiles found
      if (newCount === 25 - mineCount) {
        handleCashout(newCount);
      }
    }
  };

  const handleCashout = (count = revealedCount) => {
    if (gameState !== 'playing' || count === 0) return;

    const winAmount = betAmount * getMultiplier(count);
    const profit = winAmount - betAmount;
    
    updateBalance(winAmount);
    updateSessionStats(betAmount, profit, true);
    setGameState('ended');
    setLastResult('win');
    
    // Reveal everything
    setTiles(prev => prev.map(t => ({ ...t, isRevealed: true })));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bomb className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold">Diamond Mines</h2>
            <p className="text-gray-400">Avoid the mines to multiply your coins.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-panel px-6 py-3 rounded-xl border-white/5">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block">Potential Win</span>
            <span className="text-xl font-mono font-bold text-success">
              {gameState === 'playing' ? (betAmount * currentMultiplier).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            {/* Bet Amount */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bet Amount</label>
              <div className="flex bg-surface rounded-lg border border-white/10 overflow-hidden">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState === 'playing'}
                  className="w-full bg-transparent p-3 text-white font-mono focus:outline-none disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setBetAmount(prev => prev / 2)} disabled={gameState === 'playing'} className="py-2 bg-surface hover:bg-white/5 rounded text-xs font-bold text-gray-400 transition-colors">1/2</button>
                <button onClick={() => setBetAmount(prev => prev * 2)} disabled={gameState === 'playing'} className="py-2 bg-surface hover:bg-white/5 rounded text-xs font-bold text-gray-400 transition-colors">x2</button>
              </div>
            </div>

            {/* Mine Count */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mines</label>
              <select 
                value={mineCount}
                onChange={(e) => setMineCount(Number(e.target.value))}
                disabled={gameState === 'playing'}
                className="w-full bg-surface border border-white/10 p-3 rounded-lg text-white font-mono focus:outline-none disabled:opacity-50 appearance-none cursor-pointer"
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} Mines</option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            {gameState !== 'playing' ? (
              <button 
                onClick={startNewGame}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full py-4 rounded-xl font-display font-bold text-lg btn-primary shadow-[0_0_30px_rgba(255,42,95,0.3)] hover:shadow-[0_0_50px_rgba(255,42,95,0.5)] transition-all"
              >
                BET
              </button>
            ) : (
              <button 
                onClick={() => handleCashout()}
                className="w-full py-4 rounded-xl font-display font-bold text-lg bg-success text-background hover:bg-success/90 shadow-[0_0_30px_rgba(0,255,100,0.3)] transition-all"
              >
                CASHOUT ({(betAmount * currentMultiplier).toFixed(2)})
              </button>
            )}

            {/* Multipliers List */}
            <div className="space-y-2 pt-4 border-t border-white/5">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upcoming Payouts</span>
               <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface/50 p-2 rounded border border-white/5 flex justify-between items-center opacity-50">
                    <span className="text-[10px] text-gray-400">Next</span>
                    <span className="text-xs font-mono font-bold text-success">{nextMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="bg-surface/50 p-2 rounded border border-white/5 flex justify-between items-center opacity-30">
                    <span className="text-[10px] text-gray-400">+2 Tiles</span>
                    <span className="text-xs font-mono font-bold text-success">{getMultiplier(revealedCount + 2).toFixed(2)}x</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="lg:col-span-3">
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[600px]">
            {/* Background Decorations */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-success/5 rounded-full blur-3xl"></div>

            <div className="grid grid-cols-5 gap-3 relative z-10">
              {tiles.length === 0 ? (
                // Initial empty state
                Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="w-16 h-16 md:w-24 md:h-24 bg-surface/50 border border-white/5 rounded-xl"></div>
                ))
              ) : (
                tiles.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => handleTileClick(tile.id)}
                    disabled={tile.isRevealed || gameState !== 'playing'}
                    className={`
                      w-16 h-16 md:w-24 md:h-24 rounded-xl flex items-center justify-center transition-all duration-300 transform
                      ${!tile.isRevealed 
                        ? 'bg-surface hover:bg-surface/80 border border-white/10 hover:scale-105 hover:shadow-xl' 
                        : tile.isMine 
                          ? 'bg-danger/20 border-2 border-danger shadow-[0_0_20px_rgba(255,50,50,0.3)] rotate-12 scale-90' 
                          : 'bg-success/20 border-2 border-success shadow-[0_0_20px_rgba(0,255,100,0.3)] scale-100'}
                    `}
                  >
                    {tile.isRevealed && (
                      tile.isMine ? (
                        <Bomb className="w-8 h-8 md:w-12 md:h-12 text-danger animate-in zoom-in duration-300" />
                      ) : (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                          <Gem className="w-8 h-8 md:w-12 md:h-12 text-success drop-shadow-[0_0_10px_rgba(0,255,100,0.5)]" />
                        </div>
                      )
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Game Result Overlay */}
            {gameState === 'ended' && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                <div className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 ${lastResult === 'win' ? 'bg-success/10 border-success shadow-[0_0_50px_rgba(0,255,100,0.2)]' : 'bg-danger/10 border-danger shadow-[0_0_50px_rgba(255,50,50,0.2)]'}`}>
                  {lastResult === 'win' ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-success" />
                      </div>
                      <h3 className="text-4xl font-display font-black text-success">VICTORY!</h3>
                      <p className="text-xl text-white font-mono font-bold">+{potentialProfit.toFixed(2)} COINS</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-danger/20 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10 text-danger" />
                      </div>
                      <h3 className="text-4xl font-display font-black text-danger">BOMBED</h3>
                      <p className="text-xl text-gray-400 font-bold">Better luck next time!</p>
                    </>
                  )}
                  <button 
                    onClick={() => { setTiles([]); setGameState('betting'); setRevealedCount(0); }}
                    className="mt-4 px-8 py-3 bg-white text-background rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Probability Footer */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap gap-8 justify-center border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary font-bold">25</div>
          <span className="text-sm text-gray-400 font-medium">Total Tiles</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-danger font-bold">{mineCount}</div>
          <span className="text-sm text-gray-400 font-medium">Hidden Mines</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-success font-bold">{25 - mineCount}</div>
          <span className="text-sm text-gray-400 font-medium">Safe Diamonds</span>
        </div>
      </div>
    </div>
  );
}
