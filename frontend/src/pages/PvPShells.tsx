import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, User, Target, CheckCircle2 } from 'lucide-react';
import { socket } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

export default function PvPShells() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'revealing' | 'rematch_phase'>('waiting');
  const [stake, setStake] = useState<number>(0);
  const [opponentId] = useState<string>('Opponent');
  const [myPick, setMyPick] = useState<number | null>(null);
  const [opponentPicked, setOpponentPicked] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  
  // Rematch state
  const [rematchProposed, setRematchProposed] = useState(false);
  const [proposedStake, setProposedStake] = useState<number>(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    socket.emit('join_match', matchId);

    socket.on('player_joined', () => {
      setGameState('playing');
    });

    socket.on('opponent_picked', () => {
      setOpponentPicked(true);
    });

    socket.on('match_result', (result) => {
      setMatchResult(result);
      setGameState('revealing');
      setTimeout(() => {
        setGameState('rematch_phase');
      }, 4000);
    });

    socket.on('rematch_proposed', (data: { newStake: number }) => {
      setRematchProposed(true);
      setProposedStake(data.newStake);
    });

    socket.on('rematch_started', (data: { stake: number }) => {
      setGameState('playing');
      setStake(data.stake);
      setMyPick(null);
      setOpponentPicked(false);
      setMatchResult(null);
      setRematchProposed(false);
      setHasVoted(false);
    });

    socket.on('match_ended', () => {
      navigate('/ranked');
    });

    return () => {
      socket.off('player_joined');
      socket.off('opponent_picked');
      socket.off('match_result');
      socket.off('rematch_proposed');
      socket.off('rematch_started');
      socket.off('match_ended');
    };
  }, [matchId, navigate]);

  const handlePick = (index: number) => {
    if (gameState !== 'playing' || myPick !== null) return;
    setMyPick(index);
    socket.emit('submit_pick', { matchId, pick: index });
  };

  const handleProposeRematch = (newStake: number) => {
    socket.emit('propose_rematch', { matchId, newStake });
    setHasVoted(true);
  };

  const handleVoteRematch = (accept: boolean) => {
    socket.emit('vote_rematch', { matchId, accept });
    setHasVoted(true);
    if (!accept) navigate('/ranked');
  };

  const myData = matchResult?.p1?.socketId === socket.id ? matchResult?.p1 : matchResult?.p2;
  const isWinner = matchResult?.winnerId !== 'draw' && matchResult?.winnerId === myData?.userId;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-surface/50 p-6 rounded-2xl border border-white/10 glass-panel">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold">You (Guest)</div>
            <div className="text-xs text-primary font-mono">1,842 ELO</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-widest">Stake Pot</div>
          <div className="text-3xl font-display font-black text-primary drop-shadow-[0_0_15px_rgba(255,42,95,0.4)]">
            {(stake * 2).toFixed(2)} <span className="text-sm">ETH</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <User className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="font-bold">{opponentId}</div>
            <div className="text-xs text-secondary font-mono">1,890 ELO</div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-12 rounded-3xl min-h-[500px] flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_50%_50%,rgba(255,42,95,0.05),transparent)]">
        {gameState === 'waiting' ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div>
            <h3 className="text-2xl font-display font-bold">Waiting for opponent...</h3>
          </div>
        ) : (
          <div className="w-full space-y-12">
            {/* Status Indicator */}
            <div className="flex justify-center gap-8 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${myPick !== null ? 'bg-success/20 border-success text-success' : 'bg-surface border-white/10 text-gray-500'}`}>
                {myPick !== null ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                <span className="text-xs font-bold uppercase tracking-widest">You {myPick !== null ? 'Picked' : 'Picking...'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${opponentPicked ? 'bg-success/20 border-success text-success' : 'bg-surface border-white/10 text-gray-500'}`}>
                {opponentPicked ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                <span className="text-xs font-bold uppercase tracking-widest">Opponent {opponentPicked ? 'Picked' : 'Picking...'}</span>
              </div>
            </div>

            {/* Cups Board */}
            <div className="flex justify-center gap-8 md:gap-16">
              {[0, 1, 2].map((id) => (
                <motion.div
                  key={id}
                  onClick={() => handlePick(id)}
                  className={`relative w-24 h-32 md:w-32 md:h-40 cursor-pointer group ${gameState !== 'playing' || myPick !== null ? 'cursor-default' : ''}`}
                >
                  <motion.div
                    animate={{
                      y: (gameState === 'revealing' && (id === matchResult?.winningCup || id === myPick)) ? -80 : 0,
                    }}
                    className={`absolute inset-0 bg-gradient-to-b from-primary/80 to-primary rounded-t-[40%] rounded-b-lg shadow-xl z-20 flex items-center justify-center border-t border-white/20 ${
                      myPick === id ? 'ring-4 ring-primary ring-offset-4 ring-offset-background' : ''
                    } ${gameState === 'revealing' && id === matchResult?.winningCup ? 'ring-4 ring-success ring-offset-4 ring-offset-background' : ''}`}
                  >
                    <Target className={`w-12 h-12 text-white/20 transition-transform duration-300 ${gameState === 'playing' && myPick === null ? 'group-hover:scale-110' : ''}`} />
                  </motion.div>

                  {/* Ball */}
                  <AnimatePresence>
                    {gameState === 'revealing' && id === matchResult?.winningCup && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_20px_white] z-10"
                      />
                    )}
                  </AnimatePresence>

                  {/* Pick Labels */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-1 items-center">
                    {myPick === id && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">Your Pick</span>}
                    {gameState === 'revealing' && (matchResult?.p1?.socketId === socket.id ? matchResult?.p2?.pick : matchResult?.p1?.pick) === id && (
                      <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase">Opponent</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Results Overlay */}
            <AnimatePresence>
              {gameState === 'revealing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mt-12"
                >
                  <div className={`text-6xl font-display font-black tracking-tighter italic ${matchResult?.winnerId === 'draw' ? 'text-gray-400' : isWinner ? 'text-success' : 'text-danger'}`}>
                    {matchResult?.winnerId === 'draw' ? 'DRAW!' : isWinner ? 'VICTORY!' : 'DEFEAT'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Rematch Section */}
      <AnimatePresence>
        {gameState === 'rematch_phase' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-panel p-8 rounded-2xl border-primary/20 space-y-6"
          >
            {!rematchProposed ? (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h3 className="text-2xl font-display font-bold">Propose a Rematch?</h3>
                  <p className="text-gray-400">The winner (or either on draw) can set a new stake.</p>
                </div>
                <div className="flex items-center gap-4 w-full max-w-md">
                  <input 
                    type="number"
                    value={proposedStake}
                    onChange={(e) => setProposedStake(Number(e.target.value))}
                    className="flex-1 bg-surface border border-white/10 p-4 rounded-xl font-mono text-xl outline-none focus:border-primary"
                    placeholder="New Stake (ETH)"
                  />
                  <button 
                    disabled={hasVoted}
                    onClick={() => handleProposeRematch(proposedStake)}
                    className="btn-primary py-4 px-8 font-bold disabled:opacity-50"
                  >
                    Propose
                  </button>
                </div>
                <button onClick={() => navigate('/ranked')} className="text-gray-500 hover:text-white transition-colors">Return to Lobby</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h3 className="text-2xl font-display font-bold">Rematch Proposed!</h3>
                  <p className="text-gray-400">New Stake: <span className="text-white font-mono font-bold">{proposedStake} ETH</span></p>
                </div>
                <div className="flex gap-4 w-full max-w-sm">
                  <button 
                    disabled={hasVoted}
                    onClick={() => handleVoteRematch(true)}
                    className="flex-1 bg-success py-4 rounded-xl font-bold hover:bg-success/80 transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button 
                    disabled={hasVoted}
                    onClick={() => handleVoteRematch(false)}
                    className="flex-1 bg-danger py-4 rounded-xl font-bold hover:bg-danger/80 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
