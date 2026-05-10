import React, { createContext, useContext, useState } from 'react';

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

const LEAGUE_ORDER: League[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const LEAGUE_MAX_GAINS: Record<League, number> = {
  Bronze: 500,
  Silver: 1000,
  Gold: 2500,
  Platinum: 5000,
  Diamond: 10000
};

const LEAGUE_WAGER_GOALS: Record<League, number> = {
  Bronze: 1000,
  Silver: 5000,
  Gold: 25000,
  Platinum: 100000,
  Diamond: 1000000 // Ultimate goal
};

const LEAGUE_REWARDS: Record<string, number> = {
  'Bronze_Silver': 100,
  'Silver_Gold': 500,
  'Gold_Platinum': 2500,
  'Platinum_Diamond': 10000
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
  recordWager: (amount: number, isRanked?: boolean) => void;
  getMaxGain: () => number;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(1000);
  const [isLoading] = useState(false);
  const [league, setLeague] = useState<League>('Bronze');
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [wageredAmount, setWageredAmount] = useState(0);

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const recordWager = (amount: number, isRanked: boolean = false) => {
    // 1. Update Wagered Amount
    setWageredAmount(prev => {
      const nextWagered = prev + amount;
      const currentGoal = LEAGUE_WAGER_GOALS[league];
      
      // Check for Rank Up
      if (nextWagered >= currentGoal) {
        const currentIndex = LEAGUE_ORDER.indexOf(league);
        if (currentIndex < LEAGUE_ORDER.length - 1) {
          const nextLeague = LEAGUE_ORDER[currentIndex + 1];
          const rewardKey = `${league}_${nextLeague}`;
          const reward = LEAGUE_REWARDS[rewardKey] || 0;
          
          // Execute Rank Up
          setTimeout(() => {
            setLeague(nextLeague);
            setWageredAmount(0); // Reset wager progress for new rank
            updateBalance(reward);
            alert(`🏆 LEAGUE UP! You are now ${nextLeague}. Reward: +${reward} COINS`);
          }, 100);
          
          return 0;
        }
      }
      return nextWagered;
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

  return (
    <BalanceContext.Provider value={{ 
      balance, updateBalance, isLoading, league, xp, level, wageredAmount, wagerGoal, recordWager, getMaxGain 
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
