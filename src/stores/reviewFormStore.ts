import { saveGameReview, IGDBGame } from "@/lib/api";
import { ScoreByGameLength, SectorScoreMultiplier } from "@/lib/constants";
import { GameLength, GameStatusType, ScoreDetails } from "@/lib/types";
import { create } from "zustand";
import usePlayerStore from "./playerStore";
import { SectorsById } from "@/lib/mockData";

const useReviewFormStore = create<{
  rating: number;
  gameTitle: string;
  gameTime: GameLength | null;
  gameStatus: GameStatusType | null;
  gameReview: string;
  selectedGame: IGDBGame | null;
  error: string | null;
  isSubmitting: boolean;
  setRating: (value: number) => void;
  setGameTitle: (value: string) => void;
  setGameTime: (value: GameLength) => void;
  setGameStatus: (value: GameStatusType) => void;
  setGameReview: (value: string) => void;
  setSelectedGame: (game: IGDBGame | null) => void;
  sendReview: (scores: number) => Promise<void>;
  getReviewScores: () => ScoreDetails;
  clearError: () => void;
  retrySubmit: () => Promise<void>;
}>((set, get) => ({
  rating: 0,
  gameTitle: "",
  gameTime: null,
  gameStatus: null,
  gameReview: "",
  selectedGame: null,
  error: null,
  isSubmitting: false,

  setRating: (value) => set({ rating: value }),
  setGameTitle: (value) => set({ gameTitle: value }),
  setGameTime: (value) => set({ gameTime: value }),
  setGameStatus: (value) => set({ gameStatus: value }),
  setGameReview: (value) => set({ gameReview: value }),
  setSelectedGame: (game) => set({ selectedGame: game }),
  clearError: () => set({ error: null }),
  sendReview: async (scores: number) => {
    const { rating, gameTitle, gameTime, gameStatus, gameReview, selectedGame } = get();

    if (!gameStatus) {
      throw new Error("Game status is required");
    }

    const length = gameStatus === "drop" ? "drop" : gameTime;
    if (!length) {
      throw new Error("Game length is required");
    }

    set({ isSubmitting: true, error: null });

    try {
      await saveGameReview({
        title: gameTitle,
        status: gameStatus,
        rating,
        review: gameReview,
        length,
        scores,
        game_id: selectedGame?.id || null,
      });

      set({
        rating: 0,
        gameTitle: "",
        gameTime: null,
        gameStatus: null,
        gameReview: "",
        selectedGame: null,
        error: null,
      });
    } catch (error) {
      console.error('Review submission failed:', error);
      set({ error: 'Не удалось отправить отзыв. Попробуйте еще раз.' });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  retrySubmit: async () => {
    const state = get();
    const scores = state.getReviewScores().total;
    await state.sendReview(scores);
  },
  getReviewScores: () => {
    const { gameStatus, gameTime } = get();
    const myPlayer = usePlayerStore.getState().myPlayer;
    const currentSectorId = myPlayer?.sector_id;
    if (!currentSectorId) {
      return {
        base: 0,
        sectorMultiplier: 0,
        total: 0,
        mapCompletionBonus: 0,
      };
    }

    const mapCompletionBonus = myPlayer.maps_completed * 5;

    const sector = SectorsById[currentSectorId];
    const sectorMultiplier = SectorScoreMultiplier[sector.type] || 1;

    if (gameStatus === "completed" && gameTime) {
      const base = ScoreByGameLength[gameTime];
      const total = base * sectorMultiplier + mapCompletionBonus;
      return {
        base,
        sectorMultiplier,
        total,
        mapCompletionBonus,
      };
    }
    if (gameStatus === "drop") {
      return {
        base: 0,
        total: 0,
        sectorMultiplier,
        mapCompletionBonus,
      };
    }
    return {
      base: 0,
      sectorMultiplier: 0,
      total: 0,
      mapCompletionBonus,
    };
  },
}));

export default useReviewFormStore;
