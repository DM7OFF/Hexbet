import { useState, useEffect } from 'react';
import { TowerControl as Tower, Shield, AlertTriangle, Trophy, Zap } from 'lucide-react';
import { useBalance } from '../context/BalanceContext.tsx';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'betting' | 'playing' | 'ended';

interface Level {
  tiles: { isMine: boolean; isRevealed: boolean }[];
  isLocked: boolean;
}

export default function Towers() {
  const { balance, updateBalance, recordWager, updateSessionStats } = useBalance();
  
  const [betAmount, setBetAmount] = useState<number>(10);

  // Auto-adjust bet amount if it exceeds balance
  useEffect(() => {
    if (betAmount > balance) {
      setBetAmount(Math.max(0, balance));
    }
  }, [balance, betAmount]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameState, setGameState] = useState<GameState>('betting');
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [tower, setTower] = useState<Level[]>([]);
  const [lastResult, setLastResult] = useState<'win' | 'loss' | null>(null);

  const HOUSE_EDGE = 0.015;
  const LEVELS_COUNT = 8;

  const difficultyConfig = {
    easy: { tilesPerRow: 3, minesPerRow: 1 },
    medium: { tilesPerRow: 2, minesPerRow: 1 },
    hard: { tilesPerRow: 3, minesPerRow: 2 },
  };

  const getMultiplier = (level: number) => {
    if (level === 0) return 1;
    const { tilesPerRow, minesPerRow } = difficultyConfig[difficulty];
    const winProb = (tilesPerRow - minesPerRow) / tilesPerRow;
    return Math.pow(1 / winProb, level) * (1 - HOUSE_EDGE);
  };

  const startNewGame = () => {
    if (betAmount > balance || betAmount <= 0) return;

    updateBalance(-betAmount);
    recordWager(betAmount);

    const { tilesPerRow, minesPerRow } = difficultyConfig[difficulty];
    const newTower: Level[] = Array.from({ length: LEVELS_COUNT }, () => {
      const rowTiles = Array.from({ length: tilesPerRow }, () => ({ isMine: false, isRevealed: false }));
      let minesPlaced = 0;
      while (minesPlaced < minesPerRow) {
        const idx = Math.floor(Math.random() * tilesPerRow);
        if (!rowTiles[idx].isMine) {
          rowTiles[idx].isMine = true;
          minesPlaced++;
        }
      }
      return { tiles: rowTiles, isLocked: true };
    });

    newTower[0].isLocked = false;
    setTower(newTower);
    setCurrentLevel(0);
    setGameState('playing');
    setLastResult(null);
  };

  const handleTileClick = (levelIdx: number, tileIdx: number) => {
    if (gameState !== 'playing' || levelIdx !== currentLevel) return;

    const newTower = [...tower];
    const tile = newTower[levelIdx].tiles[tileIdx];
    tile.isRevealed = true;

    if (tile.isMine) {
      // LOSE
      setGameState('ended');
      setLastResult('loss');
      updateSessionStats(betAmount, -betAmount, false);
      // Reveal current row
      newTower[levelIdx].tiles.forEach(t => t.isRevealed = true);
    } else {
      // WIN LEVEL
      if (levelIdx === LEVELS_COUNT - 1) {
        // FINISHED TOWER
        handleCashout(LEVELS_COUNT);
      } else {
        newTower[levelIdx + 1].isLocked = false;
        setCurrentLevel(levelIdx + 1);
      }
    }
    setTower(newTower);
  };

  const handleCashout = (level = currentLevel) => {
    if (gameState !== 'playing' || level === 0) return;

    const winAmount = betAmount * getMultiplier(level);
    const profit = winAmount - betAmount;
    
    updateBalance(winAmount);
    updateSessionStats(betAmount, profit, true);
    setGameState('ended');
    setLastResult('win');
    
    // Reveal all
    setTower(prev => prev.map(l => ({ ...l, tiles: l.tiles.map(t => ({ ...t, isRevealed: true })) })));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
            <Tower className="w-8 h-8 text-warning" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold">Tower of Fortune</h2>
            <p className="text-gray-400">Climb the tower, collect the gold, avoid the traps.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-panel px-6 py-3 rounded-xl border-white/5 bg-surface/50">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block">Current Payout</span>
            <span className="text-xl font-mono font-bold text-warning">
              {getMultiplier(currentLevel).toFixed(2)}x
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bet Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={gameState === 'playing'}
                className="w-full bg-surface border border-white/10 p-3 rounded-lg text-white font-mono focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    disabled={gameState === 'playing'}
                    className={`py-2 rounded text-[10px] font-black uppercase tracking-tighter transition-all ${
                      difficulty === d 
                        ? 'bg-warning text-background shadow-lg shadow-warning/20' 
                        : 'bg-surface text-gray-500 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {gameState !== 'playing' ? (
              <button 
                onClick={startNewGame}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full py-4 rounded-xl font-display font-bold text-lg btn-warning text-background shadow-[0_0_30px_rgba(255,170,0,0.3)] hover:shadow-[0_0_50px_rgba(255,170,0,0.5)] transition-all"
              >
                PLAY TOWER
              </button>
            ) : (
              <button 
                onClick={() => handleCashout()}
                className="w-full py-4 rounded-xl font-display font-bold text-lg bg-success text-background hover:bg-success/90 shadow-[0_0_30px_rgba(0,255,100,0.3)] transition-all"
              >
                CASHOUT ({(betAmount * getMultiplier(currentLevel)).toFixed(2)})
              </button>
            )}

            <div className="space-y-2 pt-4 border-t border-white/5">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rewards Progression</span>
               <div className="space-y-1">
                  {[...Array(5)].map((_, i) => {
                    const level = i + 1;
                    return (
                      <div key={i} className={`flex justify-between items-center p-2 rounded text-[10px] font-mono ${level === currentLevel + 1 ? 'bg-warning/20 text-warning' : 'text-gray-500'}`}>
                        <span>Level {level}</span>
                        <span className="font-bold">{getMultiplier(level).toFixed(2)}x</span>
                      </div>
                    );
                  })}
                  <div className="text-center text-[10px] text-gray-600">... up to {getMultiplier(LEVELS_COUNT).toFixed(2)}x</div>
               </div>
            </div>
          </div>
        </div>

        {/* Game Tower */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md relative overflow-hidden flex flex-col-reverse gap-3">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-warning/5 rounded-full blur-3xl pointer-events-none"></div>

            {tower.length === 0 ? (
               Array.from({ length: LEVELS_COUNT }).map((_, i) => (
                <div key={i} className="h-14 bg-surface/30 rounded-xl border border-white/5 opacity-50"></div>
              ))
            ) : (
              tower.map((level, levelIdx) => (
                <div 
                  key={levelIdx} 
                  className={`
                    flex gap-3 h-16 transition-all duration-300
                    ${level.isLocked ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}
                    ${levelIdx === currentLevel ? 'scale-105 z-10' : 'scale-95'}
                  `}
                >
                  <div className="w-8 flex items-center justify-center text-[10px] font-black text-gray-600">
                    L{levelIdx + 1}
                  </div>
                  {level.tiles.map((tile, tileIdx) => (
                    <button
                      key={tileIdx}
                      onClick={() => handleTileClick(levelIdx, tileIdx)}
                      disabled={tile.isRevealed || level.isLocked || gameState !== 'playing'}
                      className={`
                        flex-1 rounded-xl flex items-center justify-center border-2 transition-all duration-300
                        ${!tile.isRevealed 
                          ? 'bg-surface border-white/10 hover:border-warning/50 hover:bg-surface/80 shadow-lg' 
                          : tile.isMine 
                            ? 'bg-danger/20 border-danger animate-in shake duration-300' 
                            : 'bg-success/20 border-success shadow-[0_0_15px_rgba(0,255,100,0.2)] animate-in zoom-in duration-300'}
                      `}
                    >
                      {tile.isRevealed ? (
                        tile.isMine ? <AlertTriangle className="w-6 h-6 text-danger" /> : <Shield className="w-6 h-6 text-success" />
                      ) : levelIdx === currentLevel ? (
                        <Zap className="w-4 h-4 text-warning/20 animate-pulse" />
                      ) : null}
                    </button>
                  ))}
                  <div className="w-16 flex items-center justify-center font-mono text-[10px] font-bold text-success">
                    +{getMultiplier(levelIdx + 1).toFixed(2)}x
                  </div>
                </div>
              ))
            )}

            {/* Victory/Defeat Overlay */}
            {gameState === 'ended' && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-md z-30 flex flex-col items-center justify-center animate-in zoom-in duration-500 p-8">
                <div className={`w-full max-w-xs p-8 rounded-3xl border-2 flex flex-col items-center gap-6 ${lastResult === 'win' ? 'bg-success/10 border-success' : 'bg-danger/10 border-danger'}`}>
                  {lastResult === 'win' ? (
                    <>
                      <Trophy className="w-16 h-16 text-success drop-shadow-[0_0_20px_rgba(0,255,100,0.5)]" />
                      <div className="text-center">
                        <h3 className="text-3xl font-display font-black text-success uppercase">Climbed!</h3>
                        <p className="text-xl font-mono font-bold text-white">+{ (betAmount * getMultiplier(currentLevel) - betAmount).toFixed(2) } COINS</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-16 h-16 text-danger drop-shadow-[0_0_20px_rgba(255,50,50,0.5)]" />
                      <div className="text-center">
                        <h3 className="text-3xl font-display font-black text-danger uppercase">Tower Fell</h3>
                        <p className="text-gray-400 font-bold italic">Better luck next floor!</p>
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => { setTower([]); setGameState('betting'); }}
                    className="w-full py-3 bg-white text-background rounded-xl font-bold hover:scale-105 transition-all shadow-xl"
                  >
                    TRY AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
