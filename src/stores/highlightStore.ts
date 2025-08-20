import { create } from 'zustand';

interface HighlightStore {
  highlightedPlayerId: number | null;
  setHighlightedPlayer: (playerId: number | null) => void;
}

const useHighlightStore = create<HighlightStore>((set) => ({
  highlightedPlayerId: null,
  setHighlightedPlayer: (playerId) => set({ highlightedPlayerId: playerId }),
}));

export default useHighlightStore;
