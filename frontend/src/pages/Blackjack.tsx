import { useState, useEffect } from 'react';
import { useBalance } from '../context/BalanceContext';
import { Wallet, Coins, Trophy, RotateCcw } from 'lucide-react';

type Card = {
  suit: string;
  value: string;
  weight: number;
};

const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = [
  { v: 'A', w: 11 }, { v: '2', w: 2 }, { v: '3', w: 3 }, { v: '4', w: 4 },
  { v: '5', w: 5 }, { v: '6', w: 6 }, { v: '7', w: 7 }, { v: '8', w: 8 },
  { v: '9', w: 9 }, { v: '10', w: 10 }, { v: 'J', w: 10 }, { v: 'Q', w: 10 }, { v: 'K', w: 10 }
];

export default function Blackjack() {
  const { balance, updateBalance, recordWager, getMaxGain, updateSessionStats } = useBalance();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'end'>('betting');
  const [message, setMessage] = useState('');
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'draw' | null>(null);

  // Auto-adjust bet amount if it exceeds balance
  useEffect(() => {
    if (betAmount > balance) {
      setBetAmount(Math.max(0, balance));
    }
  }, [balance, betAmount]);

  const createDeck = () => {
    let newDeck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(val => {
        newDeck.push({ suit, value: val.v, weight: val.w });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const getHandTotal = (hand: Card[]) => {
    let total = hand.reduce((acc, card) => acc + card.weight, 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const startNextGame = () => {
    if (betAmount > balance) return;
    
    updateBalance(-betAmount);
    recordWager(betAmount);
    
    const newDeck = createDeck();
    const p1 = newDeck.pop()!;
    const d1 = newDeck.pop()!;
    const p2 = newDeck.pop()!;
    const d2 = newDeck.pop()!;

    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setDeck(newDeck);
    setGameState('playing');
    setMessage('');
    setGameResult(null);

    if (getHandTotal([p1, p2]) === 21) {
      handleStand([p1, p2], [d1, d2], newDeck);
    }
  };

  const handleHit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop()!;
    const newHand = [...playerHand, newCard];
    
    setPlayerHand(newHand);
    setDeck(newDeck);

    if (getHandTotal(newHand) > 21) {
      endGame('loss', 'Bust! Dealer wins.');
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand, currentDeck = deck) => {
    setGameState('dealer_turn');
    
    let tempDealerHand = [...dHand];
    let tempDeck = [...currentDeck];
    
    const finishDealer = () => {
      if (getHandTotal(tempDealerHand) < 17) {
        const nextCard = tempDeck.pop()!;
        tempDealerHand.push(nextCard);
        setDealerHand([...tempDealerHand]);
        setTimeout(finishDealer, 600);
      } else {
        const dTotal = getHandTotal(tempDealerHand);
        const pTotal = getHandTotal(pHand);

        if (dTotal > 21) endGame('win', 'Dealer Busts! You win.');
        else if (dTotal > pTotal) endGame('loss', 'Dealer wins.');
        else if (dTotal < pTotal) endGame('win', 'You win!');
        else endGame('draw', 'Push.');
      }
    };
    
    setTimeout(finishDealer, 600);
  };

  const endGame = (result: 'win' | 'loss' | 'draw', msg: string) => {
    setGameState('end');
    setGameResult(result);
    setMessage(msg);

    if (result === 'win') {
      const winAmount = Math.min(betAmount * 2, getMaxGain());
      updateBalance(winAmount);
      updateSessionStats(betAmount, winAmount - betAmount, true);
    } else if (result === 'draw') {
      updateBalance(betAmount);
    } else {
      updateSessionStats(betAmount, -betAmount, false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-display font-bold text-success">Blackjack <span className="text-gray-500 text-xl">Casino</span></h2>
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-400 uppercase tracking-widest">Edge: 0.5%</span>
          </div>
          <p className="text-gray-400 mt-2">Beat the dealer to 21. Standard 3:2 rules.</p>
        </div>
        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-success/20">
          <div className="p-2 rounded-lg bg-success/10">
            <Wallet className="w-5 h-5 text-success" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Your Balance</div>
            <div className="text-xl font-mono font-bold text-white">{balance.toFixed(2)} COINS</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Controls */}
        <div className="glass-panel p-8 rounded-3xl space-y-6 border-white/5 h-fit">
          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Coins className="w-4 h-4 text-success" /> Bet Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
              disabled={gameState !== 'betting' && gameState !== 'end'}
              className="w-full bg-surface border-2 border-white/5 rounded-2xl p-4 font-mono font-bold text-xl focus:border-success/50 transition-all outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-4">
            {gameState === 'betting' || gameState === 'end' ? (
              <button
                onClick={startNextGame}
                disabled={betAmount <= 0 || betAmount > balance}
                className="w-full py-6 rounded-2xl bg-success text-surface font-black text-xl shadow-lg shadow-success/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
              >
                {gameState === 'end' ? 'PLAY AGAIN' : 'DEAL CARDS'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleHit}
                  disabled={gameState !== 'playing'}
                  className="py-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10 disabled:opacity-50"
                >
                  HIT
                </button>
                <button
                  onClick={() => handleStand()}
                  disabled={gameState !== 'playing'}
                  className="py-6 rounded-2xl bg-primary text-white font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  STAND
                </button>
              </div>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm ${
              gameResult === 'win' ? 'bg-success/20 text-success' : 
              gameResult === 'loss' ? 'bg-danger/20 text-danger' : 'bg-white/10 text-white'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Center: Table */}
        <div className="lg:col-span-3 space-y-8">
          <div className="glass-panel min-h-[500px] rounded-[50px] relative overflow-hidden border-8 border-surface/50 bg-[#1a4a1a] shadow-inner p-12 flex flex-col justify-between">
            {/* Dealer Side */}
            <div className="space-y-6">
              <div className="flex justify-center items-center gap-4">
                <div className="h-[2px] w-20 bg-white/10"></div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Dealer</div>
                <div className="h-[2px] w-20 bg-white/10"></div>
              </div>
              <div className="flex justify-center gap-4 min-h-[160px]">
                {dealerHand.map((card, i) => (
                  <div 
                    key={i}
                    className={`w-28 h-40 rounded-xl bg-white shadow-xl flex flex-col justify-between p-3 animate-in zoom-in-95 duration-300 ${
                      i === 1 && gameState === 'playing' ? 'bg-gradient-to-br from-gray-700 to-gray-900 !text-transparent' : ''
                    }`}
                  >
                    {!(i === 1 && gameState === 'playing') && (
                      <>
                        <div className={`text-2xl font-bold ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                          {card.value}
                        </div>
                        <div className={`text-5xl self-center ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                          {card.suit}
                        </div>
                        <div className={`text-2xl font-bold rotate-180 ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                          {card.value}
                        </div>
                      </>
                    )}
                    {i === 1 && gameState === 'playing' && (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <RotateCcw className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {gameState !== 'playing' && dealerHand.length > 0 && (
                <div className="text-center text-white/60 font-mono font-bold">
                  Total: {getHandTotal(dealerHand)}
                </div>
              )}
            </div>

            {/* Middle Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
              <Trophy className="w-64 h-64 text-white" />
            </div>

            {/* Player Side */}
            <div className="space-y-6">
              <div className="flex justify-center gap-4 min-h-[160px]">
                {playerHand.map((card, i) => (
                  <div 
                    key={i}
                    className="w-28 h-40 rounded-xl bg-white shadow-xl flex flex-col justify-between p-3 animate-in slide-in-from-bottom-8 duration-300"
                  >
                    <div className={`text-2xl font-bold ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                      {card.value}
                    </div>
                    <div className={`text-5xl self-center ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                      {card.suit}
                    </div>
                    <div className={`text-2xl font-bold rotate-180 ${card.suit === '♥' || card.suit === '♦' ? 'text-danger' : 'text-black'}`}>
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center gap-4">
                <div className="h-[2px] w-20 bg-white/10"></div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Player</div>
                <div className="h-[2px] w-20 bg-white/10"></div>
              </div>
              {playerHand.length > 0 && (
                <div className="text-center text-white font-mono font-bold text-xl">
                  {getHandTotal(playerHand)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
