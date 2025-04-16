import { create } from "zustand";

const useReviewFormStore = create<{
  rating: number;
  gameTitle: string;
  gameTime: string;
  gameStatus: string;
  gameReview: string;
  setRating: (value: number) => void;
  setGameTitle: (value: string) => void;
  setGameTime: (value: string) => void;
  setGameStatus: (value: string) => void;
  setGameReview: (value: string) => void;
  sendReview: () => void;
}>((set, get) => ({
  rating: 0,
  gameTitle: '',
  gameTime: '',
  gameStatus: '',
  gameReview: '',

  setRating: (value) => set({ rating: value }),
  setGameTitle: (value) => set({ gameTitle: value }),
  setGameTime: (value) => set({ gameTime: value }),
  setGameStatus: (value) => set({ gameStatus: value }),
  setGameReview: (value) => set({ gameReview: value }),
  sendReview: () => {
    console.log({
      rating: get().rating,
      gameTitle: get().gameTitle,
      gameTime: get().gameTime,
      gameStatus: get().gameStatus,
      gameReview: get().gameReview
    })
  },
}));

export default useReviewFormStore;
