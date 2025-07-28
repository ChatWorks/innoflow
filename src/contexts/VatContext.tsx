import React, { createContext, useContext, useState } from 'react';

interface VatContextType {
  includeVat: boolean;
  toggleVat: () => void;
  applyVat: (amount: number) => number;
}

const VatContext = createContext<VatContextType | undefined>(undefined);

export const VAT_RATE = 1.21;

export function VatProvider({ children }: { children: React.ReactNode }) {
  const [includeVat, setIncludeVat] = useState(false);

  const toggleVat = () => {
    setIncludeVat(!includeVat);
  };

  const applyVat = (amount: number) => {
    return includeVat ? amount * VAT_RATE : amount;
  };

  return (
    <VatContext.Provider value={{ includeVat, toggleVat, applyVat }}>
      {children}
    </VatContext.Provider>
  );
}

export function useVat() {
  const context = useContext(VatContext);
  if (context === undefined) {
    throw new Error('useVat must be used within a VatProvider');
  }
  return context;
}