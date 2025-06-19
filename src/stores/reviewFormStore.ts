import { saveGameReview } from "@/lib/api";
import { ScoreByGameLength, SectorScoreMultiplier } from "@/lib/constants";
import { GameLength, GameStatusType } from "@/lib/types";
import { create } from "zustand";
import usePlayerStore from "./playerStore";
import { SectorsById } from "@/lib/mockData";

const useReviewFormStore = create<{
  rating: number;
  gameTitle: string;
  gameTime: GameLength | null;
  gameStatus: GameStatusType | null;
  gameReview: string;
  setRating: (value: number) => void;
  setGameTitle: (value: string) => void;
  setGameTime: (value: GameLength) => void;
  setGameStatus: (value: GameStatusType) => void;
  setGameReview: (value: string) => void;
  sendReview: (scores: number) => Promise<void>;
  getReviewScores: () => number;
}>((set, get) => ({
  rating: 0,
  gameTitle: "",
  gameTime: null,
  gameStatus: null,
  gameReview: "",

  setRating: (value) => set({ rating: value }),
  setGameTitle: (value) => set({ gameTitle: value }),
  setGameTime: (value) => set({ gameTime: value }),
  setGameStatus: (value) => set({ gameStatus: value }),
  setGameReview: (value) => set({ gameReview: value }),
  sendReview: async (scores: number) => {
    const { rating, gameTitle, gameTime, gameStatus, gameReview } = get();

    if (!gameStatus) {
      throw new Error("Game status is required");
    }

    const length = gameStatus === "drop" ? "drop" : gameTime;
    if (!length) {
      throw new Error("Game length is required");
    }

    await saveGameReview({
      title: gameTitle,
      status: gameStatus,
      rating,
      review: gameReview,
      length,
      scores,
    });

    set({
      rating: 0,
      gameTitle: "",
      gameTime: null,
      gameStatus: null,
      gameReview: "",
    });
  },
  getReviewScores: () => {
    const { gameStatus, gameTime } = get();
    const currentSectorId = usePlayerStore.getState().myPlayer?.sector_id;
    if (!currentSectorId) {
      throw new Error("Current sector not found");
    }

    const sector = SectorsById[currentSectorId];

    if (gameStatus === "completed" && gameTime) {
      const baseScores = ScoreByGameLength[gameTime];
      const multiliper = SectorScoreMultiplier[sector.type] || 1;
      const scores = baseScores * multiliper;
      return scores;
    }
    if (gameStatus === "drop") {
      return 0;
    }
    return 0;
  },
}));

export default useReviewFormStore;
