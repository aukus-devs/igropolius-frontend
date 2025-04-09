import { createContext, ReactNode } from 'react';

type AppContextType = {
  floorSize: number;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const floorSize = 20;

  const value = {
    floorSize,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppProvider, AppContext }
