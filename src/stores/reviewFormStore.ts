import { saveGameReview } from '@/lib/api';
import { ScoreByGameLength, SectorScoreMultiplier } from '@/lib/constants';
import { ScoreDetails } from '@/lib/types';
import { create } from 'zustand';
import { SectorsById } from '@/lib/mockData';
import { resetNotificationsQuery } from '@/lib/queryClient';
import {
  GameCompletionType,
  GameDifficulty,
  GameLength,
  IgdbGameSummary,
} from '@/lib/api-types-generated';

const useReviewFormStore = create<{
  rating: number;
  gameTitle: string;
  gameTime: GameLength | null;
  gameStatus: GameCompletionType | null;
  gameReview: string;
  gameDifficulty: GameDifficulty | null;
  vodLinks: string;
  selectedGame: IgdbGameSummary | null;
  error: string | null;
  isSubmitting: boolean;
  setRating: (value: number) => void;
  setGameTitle: (value: string) => void;
  setGameTime: (value: GameLength) => void;
  setGameStatus: (value: GameCompletionType | null) => void;
  setGameReview: (value: string) => void;
  setVodLinks: (value: string) => void;
  setSelectedGame: (game: IgdbGameSummary | null) => void;
  sendReview: () => Promise<void>;
  getReviewScores: (params: { sectorId: number; mapsCompleted: number }) => ScoreDetails;
  clearError: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  setGameDifficulty: (value: GameDifficulty) => void;
}>((set, get) => ({
  rating: 0,
  gameTitle: '',
  gameTime: null,
  gameStatus: null,
  gameReview: '',
  vodLinks: '',
  selectedGame: null,
  error: null,
  isSubmitting: false,
  open: false,
  gameDifficulty: null,

  setOpen: open => set({ open }),
  setRating: value => set({ rating: value }),
  setGameTitle: value => set({ gameTitle: value }),
  setGameTime: value => set({ gameTime: value }),
  setGameStatus: value => set({ gameStatus: value }),
  setGameReview: value => set({ gameReview: value }),
  setVodLinks: value => set({ vodLinks: value }),
  setSelectedGame: game => set({ selectedGame: game }),
  clearError: () => set({ error: null }),
  sendReview: async () => {
    const {
      rating,
      gameTitle,
      gameTime,
      gameStatus,
      gameReview,
      vodLinks,
      selectedGame,
      gameDifficulty,
    } = get();

    if (!gameStatus) {
      throw new Error('Game status is required');
    }

    const length = gameTime ?? '';

    set({ isSubmitting: true, error: null });

    try {
      await saveGameReview({
        title: gameTitle,
        status: gameStatus,
        rating,
        review: gameReview,
        length,
        vod_links: vodLinks || undefined,
        game_id: selectedGame?.id || null,
        difficulty_level: gameDifficulty,
      });

      resetNotificationsQuery();

      set({
        rating: 0,
        gameTitle: '',
        gameTime: null,
        gameStatus: null,
        gameReview: '',
        vodLinks: '',
        selectedGame: null,
        error: null,
        open: false,
        gameDifficulty: 0,
      });
    } catch (error) {
      console.error('Review submission failed:', error);
      set({ error: 'Не удалось отправить отзыв. Попробуйте еще раз.' });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  // retrySubmit: async () => {
  //   const state = get();
  //   const scores = state.getReviewScores().total;
  //   await state.sendReview(scores);
  // },

  getReviewScores: (params: { sectorId: number; mapsCompleted: number }) => {
    const { gameStatus, gameTime } = get();

    const mapCompletionBonus = params.mapsCompleted * 5;

    const sector = SectorsById[params.sectorId];
    const sectorMultiplier = SectorScoreMultiplier[sector.type] || 1;

    if (gameStatus === 'completed' && gameTime) {
      const base = ScoreByGameLength[gameTime];
      const total = base * sectorMultiplier + mapCompletionBonus;
      return {
        base,
        sectorMultiplier,
        total,
        mapCompletionBonus,
      };
    }
    if (gameStatus === 'drop') {
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
  setGameDifficulty: (value: GameDifficulty) => set({ gameDifficulty: value }),
}));

export default useReviewFormStore;
