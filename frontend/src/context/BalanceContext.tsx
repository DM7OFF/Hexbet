import React, { createContext, useContext, useState } from 'react';

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
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(1000);
  const [isLoading] = useState(false);
  const [league, setLeague] = useState<League>('Bronze V');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [wageredAmount, setWageredAmount] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const recordWager = (amount: number, isRanked: boolean = false) => {
    // Increment games played
    setGamesPlayed(prevGames => {
      const nextGames = prevGames + 1;
      const gamesGoal = LEAGUE_GAMES_GOALS[league];
      
      // Update wagered amount in parallel (need to sync both)
      setWageredAmount(prevWagered => {
        const nextWagered = prevWagered + amount;
        const wagerGoal = LEAGUE_WAGER_GOALS[league];

        // Check for Rank Up (Both conditions must be met)
        if (nextWagered >= wagerGoal && nextGames >= gamesGoal) {
          const currentIndex = LEAGUE_ORDER.indexOf(league);
          if (currentIndex < LEAGUE_ORDER.length - 1) {
            const nextLeague = LEAGUE_ORDER[currentIndex + 1];
            const rewardKey = `${league}_${nextLeague}`;
            const reward = LEAGUE_REWARDS[rewardKey] || 0;
            
            // Execute Rank Up
            setTimeout(() => {
              setLeague(nextLeague);
              setWageredAmount(0); // Reset wager progress
              setGamesPlayed(0);   // Reset games progress
              updateBalance(reward);
              alert(`🏆 LEAGUE UP! You are now ${nextLeague}. Reward: +${reward} COINS`);
            }, 100);
            
            return 0;
          }
        }
        return nextWagered;
      });

      return nextGames;
    });

    // 2. Update XP
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
      balance, updateBalance, isLoading, league, xp, level, wageredAmount, wagerGoal, gamesPlayed, gamesGoal, recordWager, getMaxGain 
    }}>
      {children}
    </BalanceContext.Provider>
  );
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
}
