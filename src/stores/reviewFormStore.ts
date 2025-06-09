import { saveGameReview } from "@/lib/api";
import { GameLength, GameStatusType } from "@/lib/types";
import { create } from "zustand";

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
  sendReview: () => Promise<void>;
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
  sendReview: async () => {
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
    });

    set({
      rating: 0,
      gameTitle: "",
      gameTime: null,
      gameStatus: null,
      gameReview: "",
    });
  },
}));

export default useReviewFormStore;
