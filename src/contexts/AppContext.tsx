import { sectorsData } from '@/lib/mockData';
import { SectorData } from '@/types';
import { createContext, ReactNode, useState } from 'react';

type AppContextType = {
  selectedSector: SectorData | null;
  setSelectedSectorId: (id: string | null) => void;
};

const AppContext = createContext<AppContextType>({
  selectedSector: null,
  setSelectedSectorId: () => { }
});

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const selectedSector = sectorsData.find(sector => sector.id === selectedSectorId) || null;

  const value = {
    selectedSector,
    setSelectedSectorId
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppProvider, AppContext }
