import { CurrentUserResponse, Settings as EventSettings } from '@/lib/api-types-generated';
import { create } from 'zustand';

type MainNotification = {
  text: string;
  tag: 'event-start-timer' | 'event-ended' | 'event-settings-error';
  variant: 'info' | 'error';
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
}

const useSystemStore = create<SystemStore>(set => ({
  eventStartTime: null,
  eventEndTime: null,
  mainNotification: null,
  disablePlayersQuery: false,
  disableCurrentPlayerQuery: false,
  myUser: null,

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
    set({ myUser: data || null });
  },
}));

export default useSystemStore;
