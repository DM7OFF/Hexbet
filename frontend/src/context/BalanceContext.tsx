import React, { createContext, useContext, useState } from 'react';

interface BalanceContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  isLoading: boolean;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(1000); // Initial balance for demo
  const [isLoading] = useState(false);

  const updateBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, isLoading }}>
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
