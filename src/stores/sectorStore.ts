import { sectorsData } from "@/lib/mockData";
import { SectorData } from "@/types";
import { create } from "zustand";

const useSectorStore = create<{
  selectedSectorId: number | null;
  selectedSector: SectorData | null;
  setSelectedSectorId: (id: number | null) => void;
}>((set) => ({
  selectedSectorId: null,
  selectedSector: null,

  setSelectedSectorId: (id) => {
    const selectedSector = sectorsData.find((sector) => sector.id === id) || null;
    set({ selectedSectorId: id, selectedSector });
  },
}));

export default useSectorStore;
