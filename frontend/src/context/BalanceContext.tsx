import React, { createContext, useContext, useState, useEffect } from 'react';

export type League = 
  | 'Bronze V' | 'Bronze IV' | 'Bronze III' | 'Bronze II' | 'Bronze I'
  | 'Silver V' | 'Silver IV' | 'Silver III' | 'Silver II' | 'Silver I'
  | 'Gold V' | 'Gold IV' | 'Gold III' | 'Gold II' | 'Gold I'
  | 'Platinum V' | 'Platinum IV' | 'Platinum III' | 'Platinum II' | 'Platinum I'
  | 'Diamond III' | 'Diamond II' | 'Diamond I';

const LEAGUE_ORDER: League[] = [
  'Bronze V', 'Bronze IV', 'Bronze III', 'Bronze II', 'Bronze I',
  'Silver V', 'Silver IV', 'Silver III', 'Silver II', 'Silver I',
  'Gold V', 'Gold IV', 'Gold III', 'Gold II', 'Gold I',
  'Platinum V', 'Platinum IV', 'Platinum III', 'Platinum II', 'Platinum I',
  'Diamond III', 'Diamond II', 'Diamond I'
];

const LEAGUE_MAX_GAINS: Record<League, number> = {
  'Bronze V': 500, 'Bronze IV': 550, 'Bronze III': 600, 'Bronze II': 650, 'Bronze I': 700,
  'Silver V': 1000, 'Silver IV': 1100, 'Silver III': 1200, 'Silver II': 1300, 'Silver I': 1400,
  'Gold V': 2500, 'Gold IV': 2700, 'Gold III': 2900, 'Gold II': 3100, 'Gold I': 3300,
  'Platinum V': 5000, 'Platinum IV': 5500, 'Platinum III': 6000, 'Platinum II': 6500, 'Platinum I': 7000,
  'Diamond III': 10000, 'Diamond II': 15000, 'Diamond I': 25000
};

const LEAGUE_WAGER_GOALS: Record<League, number> = {
  'Bronze V': 200, 'Bronze IV': 200, 'Bronze III': 200, 'Bronze II': 200, 'Bronze I': 200,
  'Silver V': 1000, 'Silver IV': 1000, 'Silver III': 1000, 'Silver II': 1000, 'Silver I': 1000,
  'Gold V': 5000, 'Gold IV': 5000, 'Gold III': 5000, 'Gold II': 5000, 'Gold I': 5000,
  'Platinum V': 20000, 'Platinum IV': 20000, 'Platinum III': 20000, 'Platinum II': 20000, 'Platinum I': 20000,
  'Diamond III': 250000, 'Diamond II': 250000, 'Diamond I': 500000
};

const LEAGUE_REWARDS: Record<string, number> = {
  'Bronze I_Silver V': 100,
  'Silver I_Gold V': 500,
  'Gold I_Platinum V': 2500,
  'Platinum I_Diamond III': 10000
};

const LEAGUE_GAMES_GOALS: Record<League, number> = {
  'Bronze V': 5, 'Bronze IV': 5, 'Bronze III': 5, 'Bronze II': 5, 'Bronze I': 5,
  'Silver V': 10, 'Silver IV': 10, 'Silver III': 10, 'Silver II': 10, 'Silver I': 10,
  'Gold V': 25, 'Gold IV': 25, 'Gold III': 25, 'Gold II': 25, 'Gold I': 25,
  'Platinum V': 50, 'Platinum IV': 50, 'Platinum III': 50, 'Platinum II': 50, 'Platinum I': 50,
  'Diamond III': 100, 'Diamond II': 100, 'Diamond I': 200
};

export interface HistoryItem {
  id: string;
  game: string;
  wager: number;
  payout: number;
  profit: number;
  multiplier: number;
  status: 'win' | 'loss' | 'draw';
  timestamp: number;
}

export interface TransactionItem {
  id: string;
  type: 'deposit' | 'withdrawal';
  crypto: string;
  cryptoAmount: number;
  usdAmount: number;
  coinsAmount: number;
  status: 'pending' | 'completed' | 'failed';
  address: string;
  timestamp: number;
}

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  isLoading: boolean;
  league: League;
  xp: number;
  level: number;
  wageredAmount: number;
  wagerGoal: number;
  gamesPlayed: number;
  gamesGoal: number;
  recordWager: (amount: number, isRanked?: boolean) => void;
  getMaxGain: () => number;
  sessionStats: {
    wins: number;
    losses: number;
    totalProfit: number;
    wagered: number;
  };
  updateSessionStats: (wager: number, profit: number, isWin: boolean, gameName?: string) => void;
  resetSessionStats: () => void;
  isStatsFloaterOpen: boolean;
  setStatsFloaterOpen: (isOpen: boolean) => void;
  history: HistoryItem[];
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'timestamp'>) => void;
  updateTransactionStatus: (id: string, status: 'pending' | 'completed' | 'failed') => void;
  clearHistory: () => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  // Load state from localStorage or use defaults
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('hexbet_balance');
    return saved ? Number(saved) : 1000;
  });
  const [isLoading] = useState(false);
  const [league, setLeague] = useState<League>(() => {
    const saved = localStorage.getItem('hexbet_league');
    return (saved as League) || 'Bronze V';
  });
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('hexbet_xp');
    return saved ? Number(saved) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const saved = localStorage.getItem('hexbet_level');
    return saved ? Number(saved) : 1;
  });
  const [wageredAmount, setWageredAmount] = useState<number>(() => {
    const saved = localStorage.getItem('hexbet_wageredAmount');
    return saved ? Number(saved) : 0;
  });
  const [gamesPlayed, setGamesPlayed] = useState<number>(() => {
    const saved = localStorage.getItem('hexbet_gamesPlayed');
    return saved ? Number(saved) : 0;
  });
  const [sessionStats, setSessionStats] = useState({ wins: 0, losses: 0, totalProfit: 0, wagered: 0 });
  const [isStatsFloaterOpen, setStatsFloaterOpen] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('hexbet_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    const saved = localStorage.getItem('hexbet_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Track gamesPlayed in a ref so we can read it from inside setState callbacks (avoids stale closure)
  const gamesPlayedRef = React.useRef(0);

  useEffect(() => {
    gamesPlayedRef.current = gamesPlayed;
  }, [gamesPlayed]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('hexbet_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('hexbet_league', league);
  }, [league]);

  useEffect(() => {
    localStorage.setItem('hexbet_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('hexbet_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('hexbet_wageredAmount', wageredAmount.toString());
  }, [wageredAmount]);

  useEffect(() => {
    localStorage.setItem('hexbet_gamesPlayed', gamesPlayed.toString());
  }, [gamesPlayed]);

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const updateSessionStats = (wager: number, profit: number, isWin: boolean, gameName?: string) => {
    setSessionStats(prev => ({
      wins: prev.wins + (isWin ? 1 : 0),
      losses: prev.losses + (!isWin ? 1 : 0),
      totalProfit: prev.totalProfit + profit,
      wagered: prev.wagered + wager
    }));

    // Guess game name from path if not provided
    let game = gameName;
    if (!game) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('dice')) game = 'Dice';
      else if (path.includes('limbo')) game = 'Limbo';
      else if (path.includes('mines')) game = 'Mines';
      else if (path.includes('towers')) game = 'Towers';
      else if (path.includes('plinko')) game = 'Plinko';
      else if (path.includes('shells')) game = 'Shell Game';
      else if (path.includes('roulette')) game = 'Roulette';
      else if (path.includes('blackjack')) game = 'Blackjack';
      else if (path.includes('ranked')) game = 'Ranked PvP';
      else game = 'Casino Game';
    }

    const payout = wager + profit;
    const multiplier = wager > 0 ? Number((payout / wager).toFixed(2)) : 0;
    const status = profit > 0 ? 'win' : (profit === 0 ? 'draw' : 'loss');

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      game,
      wager,
      payout,
      profit,
      multiplier,
      status,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 100);
      localStorage.setItem('hexbet_history', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSessionStats = () => {
    setSessionStats({ wins: 0, losses: 0, totalProfit: 0, wagered: 0 });
  };

  const addTransaction = (tx: Omit<TransactionItem, 'id' | 'timestamp'>) => {
    const newItem: TransactionItem = {
      ...tx,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };

    setTransactions(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem('hexbet_transactions', JSON.stringify(updated));
      return updated;
    });
  };

  const updateTransactionStatus = (id: string, status: 'pending' | 'completed' | 'failed') => {
    setTransactions(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, status } : t);
      localStorage.setItem('hexbet_transactions', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    setTransactions([]);
    localStorage.removeItem('hexbet_history');
    localStorage.removeItem('hexbet_transactions');
  };

  const recordWager = (amount: number, isRanked: boolean = false) => {
    if (isRanked) {
      setGamesPlayed(prevGames => {
        const nextGames = prevGames + 1;
        const gamesGoal = LEAGUE_GAMES_GOALS[league];

        setWageredAmount(prevWagered => {
          const nextWagered = prevWagered + amount;
          const wagerGoal = LEAGUE_WAGER_GOALS[league];

          if (nextWagered >= wagerGoal && nextGames >= gamesGoal) {
            const currentIndex = LEAGUE_ORDER.indexOf(league);
            if (currentIndex < LEAGUE_ORDER.length - 1) {
              const nextLeague = LEAGUE_ORDER[currentIndex + 1];
              const rewardKey = `${league}_${nextLeague}`;
              const reward = LEAGUE_REWARDS[rewardKey] || 0;

              setTimeout(() => {
                setLeague(nextLeague);
                setWageredAmount(0);
                setGamesPlayed(0);
                gamesPlayedRef.current = 0;
                setBalance(prev => prev + reward);
                console.log(`🏆 LEAGUE UP! You are now ${nextLeague}. Reward: +${reward} COINS`);
              }, 100);

              return 0;
            }
          }
          return nextWagered;
        });

        return nextGames;
      });
    } else {
      setWageredAmount(prevWagered => {
        const nextWagered = prevWagered + amount;
        const wagerGoal = LEAGUE_WAGER_GOALS[league];
        const gamesGoal = LEAGUE_GAMES_GOALS[league];

        // Use the ref to get current gamesPlayed without stale closure issues
        if (nextWagered >= wagerGoal && gamesPlayedRef.current >= gamesGoal) {
          const currentIndex = LEAGUE_ORDER.indexOf(league);
          if (currentIndex < LEAGUE_ORDER.length - 1) {
            const nextLeague = LEAGUE_ORDER[currentIndex + 1];
            const rewardKey = `${league}_${nextLeague}`;
            const reward = LEAGUE_REWARDS[rewardKey] || 0;

            setTimeout(() => {
              setLeague(nextLeague);
              setWageredAmount(0);
              setGamesPlayed(0);
              gamesPlayedRef.current = 0;
              setBalance(prev => prev + reward);
              console.log(`🏆 LEAGUE UP! You are now ${nextLeague}. Reward: +${reward} COINS`);
            }, 100);
            return 0;
          }
        }
        return nextWagered;
      });
    }

    // Update XP
    const xpGain = isRanked ? 25 : 10;
    setXp(prev => {
      const nextXp = prev + xpGain;
      const xpToLevel = level * 100;
      if (nextXp >= xpToLevel) {
        setLevel(l => l + 1);
        return nextXp - xpToLevel;
      }
      return nextXp;
    });
  };

  const getMaxGain = () => LEAGUE_MAX_GAINS[league];
  const wagerGoal = LEAGUE_WAGER_GOALS[league];
  const gamesGoal = LEAGUE_GAMES_GOALS[league];

  return (
    <BalanceContext.Provider value={{ 
      balance, updateBalance, isLoading, league, xp, level, wageredAmount, wagerGoal, gamesPlayed, gamesGoal, recordWager, getMaxGain,
      sessionStats, updateSessionStats, resetSessionStats, isStatsFloaterOpen, setStatsFloaterOpen,
      history, transactions, addTransaction, updateTransactionStatus, clearHistory
    }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}
