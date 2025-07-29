import { Settings as EventSettings } from '@/lib/api-types-generated';
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
}

const useSystemStore = create<SystemStore>(set => ({
  eventStartTime: null,
  eventEndTime: null,
  mainNotification: null,
  disablePlayersQuery: false,
  disableCurrentPlayerQuery: false,

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
}));

export default useSystemStore;
