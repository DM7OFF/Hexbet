import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swords, User, CheckCircle2 } from 'lucide-react';
import { socket } from '../App';
import { useBalance } from '../context/BalanceContext.tsx';

export default function PvPDice() {
  const { balance, updateBalance, recordWager } = useBalance();
  const { matchId } = useParams<{ matchId: string }>();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [myRoll, setMyRoll] = useState<number | null>(null);
  const [opponentRoll, setOpponentRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<'me' | 'opponent' | 'draw' | null>(null);
  const [opponentHasRolled, setOpponentHasRolled] = useState(false);

  // Rematch & Stake logic
  const [stake, setStake] = useState(0.5);
  const [proposedStake, setProposedStake] = useState<number | null>(null);
  const [rematchProposedByOpponent, setRematchProposedByOpponent] = useState(false);
  const [newStakeInput, setNewStakeInput] = useState(0.5);

  const pot = stake * 2;
  const winnerPayout = pot * 0.8;

  useEffect(() => {
    if (!matchId) return;

    // Join room
    socket.emit('join_match', matchId);

    // Both players joined, we can start
    socket.on('player_joined', () => {
      setGameState('playing');
    });

    socket.on('opponent_rolled', () => {
      setOpponentHasRolled(true);
    });

    socket.on('match_result', (data: { p1: any, p2: any }) => {
      setIsRolling(false);
      setGameState('finished');
      
      const myData = data.p1.socketId === socket.id ? data.p1 : data.p2;
      const oppData = data.p1.socketId === socket.id ? data.p2 : data.p1;
      
      setMyRoll(myData.roll);
      setOpponentRoll(oppData.roll);

      if (myData.roll > oppData.roll) {
        setWinner('me');
        updateBalance(winnerPayout); // Pay out to winner
      }
      else if (oppData.roll > myData.roll) setWinner('opponent');
      else {
        setWinner('draw');
        updateBalance(stake); // Return stake on draw
      }
      
      setNewStakeInput(stake);
    });

    socket.on('rematch_proposed', (data: { newStake: number }) => {
      setProposedStake(data.newStake);
      setRematchProposedByOpponent(true);
    });

    socket.on('rematch_started', (data: { stake: number }) => {
      setGameState('playing');
      setMyRoll(null);
      setOpponentRoll(null);
      setWinner(null);
      setStake(data.stake);
      setProposedStake(null);
      setRematchProposedByOpponent(false);
      setOpponentHasRolled(false);
    });

    socket.on('match_ended', () => {
      window.location.href = '/ranked';
    });

    return () => {
      socket.off('player_joined');
      socket.off('opponent_rolled');
      socket.off('match_result');
      socket.off('rematch_proposed');
      socket.off('rematch_started');
      socket.off('match_ended');
    };
  }, [matchId, stake, winnerPayout, updateBalance]);

  const handleRoll = () => {
    if (gameState !== 'playing' || myRoll !== null || !matchId) return;
    if (balance < stake) {
      alert("Insufficient balance for this stake!");
      return;
    }
    
    setIsRolling(true);
    updateBalance(-stake); // Deduct stake
    recordWager(stake, true); // Track progression (Ranked)

    const result = Math.floor(Math.random() * 100) + 1;
    setMyRoll(result); // Show locally instantly

    socket.emit('submit_roll', { matchId, roll: result });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Swords className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold">Dice Duel</h2>
            <p className="text-gray-400">Ranked Match • Highest Roll Wins</p>
          </div>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-xl border-primary/20 flex flex-col items-end">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Pot</span>
          <span className="text-2xl font-mono font-bold text-success">{(stake * 2).toFixed(2)} COINS</span>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
          
          {/* Player 1 (You) */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-surface border-4 ${winner === 'me' ? 'border-success' : 'border-white/10'}`}>
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary px-2 py-1 rounded text-xs font-bold shadow-lg">YOU</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-display font-bold">GuestPlayer</div>
              <div className="text-sm text-gray-400">Gold III</div>
            </div>

            <div className="h-32 flex items-center justify-center">
              {myRoll !== null ? (
                <div className={`text-6xl font-black font-display ${winner === 'me' ? 'text-success drop-shadow-[0_0_20px_rgba(0,255,100,0.5)] scale-110' : 'text-gray-400'} transition-all duration-500 animate-in zoom-in`}>
                  {myRoll}
                </div>
              ) : (
                <div className="text-gray-600 text-6xl font-black font-display">?</div>
              )}
            </div>

            {gameState === 'playing' && myRoll === null && (
              <button 
                onClick={handleRoll}
                disabled={isRolling}
                className="btn-primary py-3 px-12 text-lg animate-pulse"
              >
                {isRolling ? 'Rolling...' : 'ROLL NOW'}
              </button>
            )}
            {myRoll !== null && (
              <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-4 py-2 rounded-full">
                <CheckCircle2 className="w-5 h-5" /> Rolled
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-px h-24 bg-gradient-to-b from-transparent via-primary/50 to-transparent"></div>
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,42,95,0.3)]">
              <span className="text-2xl font-black italic text-primary">VS</span>
            </div>
            <div className="w-px h-24 bg-gradient-to-t from-transparent via-primary/50 to-transparent"></div>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-surface border-4 ${winner === 'opponent' ? 'border-success' : 'border-white/10'} ${gameState === 'waiting' ? 'animate-pulse opacity-50' : ''}`}>
                <User className="w-10 h-10 text-white" />
              </div>
              {gameState === 'playing' && <div className="absolute -bottom-2 -left-2 bg-secondary px-2 py-1 rounded text-xs font-bold text-background shadow-lg">OPP</div>}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-display font-bold">
                {gameState === 'waiting' ? 'Waiting...' : 'CryptoKing'}
              </div>
              <div className="text-sm text-gray-400">
                {gameState === 'waiting' ? 'Searching for match' : 'Gold II'}
              </div>
            </div>

            <div className="h-32 flex items-center justify-center">
              {opponentRoll !== null ? (
                <div className={`text-6xl font-black font-display ${winner === 'opponent' ? 'text-success drop-shadow-[0_0_20px_rgba(0,255,100,0.5)] scale-110' : 'text-gray-400'} transition-all duration-500 animate-in zoom-in`}>
                  {opponentRoll}
                </div>
              ) : (
                <div className="text-gray-600 text-6xl font-black font-display">
                  {gameState === 'waiting' ? '...' : '?'}
                </div>
              )}
            </div>

            {opponentRoll !== null ? (
               <div className="flex items-center gap-2 text-success font-bold bg-success/10 px-4 py-2 rounded-full">
               <CheckCircle2 className="w-5 h-5" /> Rolled
             </div>
            ) : gameState === 'playing' ? (
              <div className="text-gray-400 font-medium text-sm animate-pulse">
                {opponentHasRolled ? 'Opponent has rolled!' : 'Waiting for opponent to roll...'}
              </div>
            ) : null}
          </div>

        </div>

        {/* Result Banner */}
        {gameState === 'finished' && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-md py-8 border-y border-white/10 flex flex-col items-center justify-center z-20 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className={`text-5xl font-black font-display tracking-wider mb-4 ${
              winner === 'me' ? 'text-success drop-shadow-[0_0_20px_rgba(0,255,100,0.5)]' :
              winner === 'opponent' ? 'text-danger drop-shadow-[0_0_20px_rgba(255,50,50,0.5)]' :
              'text-white'
            }`}>
              {winner === 'me' ? 'VICTORY!' : winner === 'opponent' ? 'DEFEAT' : 'DRAW'}
            </h2>
            <p className="text-xl text-gray-300 font-medium">
              {winner === 'me' ? `You won ${winnerPayout.toFixed(2)} COINS` : winner === 'opponent' ? `You lost ${stake.toFixed(2)} COINS` : 'Stake returned'}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              {rematchProposedByOpponent && proposedStake !== null ? (
                <div className="bg-surface/50 p-4 rounded-xl border border-white/10 flex flex-col items-center gap-4">
                  <p className="text-white font-bold">{winner === 'draw' ? 'Opponent' : 'Winner'} proposed rematch for <span className="text-success">{proposedStake} COINS</span></p>
                  <div className="flex gap-4">
                    <button className="btn-secondary py-2 px-6" onClick={() => socket.emit('vote_rematch', { matchId, accept: false })}>Decline</button>
                    <button className="btn-primary py-2 px-6" onClick={() => socket.emit('vote_rematch', { matchId, accept: true })}>Accept</button>
                  </div>
                </div>
              ) : (winner === 'me' || winner === 'draw') ? (
                proposedStake === null ? (
                  <div className="flex gap-2 items-center bg-surface/50 p-2 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold px-2">New Stake:</span>
                    <input type="number" step="0.1" min="0.1" value={newStakeInput} onChange={e => setNewStakeInput(Number(e.target.value))} className="w-24 bg-surface border border-white/10 rounded px-2 py-1 font-mono text-white" />
                    <button className="btn-primary py-2 px-6" onClick={() => {
                      socket.emit('propose_rematch', { matchId, newStake: newStakeInput });
                      setProposedStake(newStakeInput);
                    }}>Propose Rematch</button>
                  </div>
                ) : (
                  <p className="text-gray-400 animate-pulse">Waiting for opponent to accept...</p>
                )
              ) : (
                <p className="text-gray-400 animate-pulse">Waiting for winner to propose rematch...</p>
              )}

              <button className="btn-secondary py-2 px-6 text-sm mt-4" onClick={() => socket.emit('leave_match', matchId)}>Leave Match</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
