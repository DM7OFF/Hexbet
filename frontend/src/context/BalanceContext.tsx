import React, { createContext, useContext, useState } from 'react';

export type League = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  isLoading: boolean;
  league: League;
  getMaxGain: () => number;
}

const LEAGUE_MAX_GAINS: Record<League, number> = {
  Bronze: 500,
  Silver: 1000,
  Gold: 2500,
  Platinum: 5000,
  Diamond: 10000
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(1000); // Initial balance for demo
  const [isLoading] = useState(false);
  const [league] = useState<League>('Gold'); // Default to Gold for demo

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const getMaxGain = () => LEAGUE_MAX_GAINS[league];

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, isLoading, league, getMaxGain }}>
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
