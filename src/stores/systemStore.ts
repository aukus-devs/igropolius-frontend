import { CurrentUserResponse, Settings as EventSettings } from '@/lib/api-types-generated';
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

  setMainNotification: (message: MainNotification | null) => {
    set({ mainNotification: message });
  },

  setEventSettings: (settings: EventSettings) => {
    const eventStartTime = settings.event_start_time
      ? parseInt(settings.event_start_time) || null
      : null;
    const eventEndTime = settings.event_end_time ? parseInt(settings.event_end_time) || null : null;

    set({
      eventStartTime,
      eventEndTime,
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
}));

export default useSystemStore;
