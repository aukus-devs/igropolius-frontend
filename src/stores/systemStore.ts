import {
  BonusCardType,
  CurrentUserResponse,
  Settings as EventSettings,
  MainBonusCardType,
} from '@/lib/api-types-generated';
import { create } from 'zustand';
import usePlayerStore from './playerStore';

type MainNotification = {
  text: string;
  tag: 'event-start-timer' | 'event-ended' | 'event-settings-error' | 'api-error';
  variant: 'info' | 'error';
  permanent?: boolean;
};

interface SystemStore {
  eventStartTime: number | null;
  eventEndTime: number | null;
  instantCardScoreMultiplier: number;

  setEventSettings: (settings: EventSettings) => void;
  clearEventSettings: () => void;
  mainNotification: MainNotification | null;
  setMainNotification: (message: MainNotification | null) => void;
  disablePlayersQuery: boolean;
  disableCurrentPlayerQuery: boolean;
  myUser: CurrentUserResponse | null;
  setMyUser: (data?: CurrentUserResponse | null) => void;
  actingUserId: number | null;
  setActingUserId: (userId: number | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  highlightedSectorId: number | null;
  setHighlightedSectorId: (sectorId: number | null) => void;
  needsToSelectModel: () => boolean;
  enableQueries: (enable: boolean) => void;
  getCardWeight: (cardType: BonusCardType) => number;
  getCardCooldown: (card: MainBonusCardType) => number;
}

const useSystemStore = create<SystemStore>((set, get) => ({
  eventStartTime: null,
  eventEndTime: null,
  mainNotification: null,
  disablePlayersQuery: false,
  disableCurrentPlayerQuery: false,
  myUser: null,
  actingUserId: null,
  accessToken: localStorage.getItem('access-token'),
  highlightedSectorId: null,
  instantCardScoreMultiplier: 1,

  setMainNotification: (message: MainNotification | null) => {
    set({ mainNotification: message });
  },

  setEventSettings: (settings: EventSettings) => {
    const eventStartTime = settings.event_start_time
      ? parseInt(settings.event_start_time) || null
      : null;
    const eventEndTime = settings.event_end_time ? parseInt(settings.event_end_time) || null : null;

    const instantCardScoreMultiplier = settings.instant_card_score_multiplier
      ? parseFloat(settings.instant_card_score_multiplier) || 1
      : 1;

    set({
      eventStartTime,
      eventEndTime,
      instantCardScoreMultiplier,
    });
  },

  clearEventSettings: () => {
    set({
      eventStartTime: null,
      eventEndTime: null,
    });
  },

  setMyUser: (data?: CurrentUserResponse | null) => {
    if (!data) {
      set({ myUser: null, actingUserId: null });
      return;
    }
    set({ myUser: data });
  },

  setActingUserId: (userId: number | null) => set({ actingUserId: userId }),

  setAccessToken: (token: string | null) => set({ accessToken: token }),
  setHighlightedSectorId: (sectorId: number | null) => set({ highlightedSectorId: sectorId }),

  needsToSelectModel: () => {
    const { myUser } = get();
    if (!myUser) {
      return false;
    }
    const myPlayer = usePlayerStore.getState().players.find(player => player.id === myUser.id);
    if (!myPlayer) {
      return false;
    }

    return !myPlayer.model_name || !myPlayer.color;
  },

  enableQueries: (enable: boolean) => {
    set({
      disablePlayersQuery: !enable,
      disableCurrentPlayerQuery: !enable,
    });
  },

  getCardWeight: (cardType: BonusCardType) => {
    const { myUser } = get();
    const cards = myUser?.bonus_cards || [];
    const card = cards.find(c => c.card_type === cardType);
    return card?.weight ?? 1;
  },

  getCardCooldown: (card: MainBonusCardType) => {
    const { myUser } = get();
    const cards = myUser?.bonus_cards || [];
    const cardData = cards.find(c => c.card_type === card);
    return cardData?.cooldown_turns ?? 0;
  },
}));

export default useSystemStore;
