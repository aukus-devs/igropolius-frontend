import { sectorsData } from "@/lib/mockData";
import { SectorData } from "@/lib/types";
import { create } from "zustand";

const useSectorStore = create<{
  selectedSector: SectorData | null;
  setSelectedSectorId: (id: number | null) => void;
}>((set) => ({
  selectedSector: null,

  setSelectedSectorId: (id) => {
    const selectedSector = sectorsData.find((sector) => sector.id === id) || null;
    set({ selectedSector });
  },
}));

export default useSectorStore;
