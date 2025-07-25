import { create } from 'zustand';

export interface EventSettings {
  event_start_time: string;
  event_end_time: string;
}

type MainNotification = {
  text: string;
  tag: 'event-start-timer' | 'event-ended';
  variant: 'info' | 'error';
};

interface EventStore {
  eventStartTime: number | null;
  eventEndTime: number | null;
  setEventSettings: (settings: EventSettings) => void;
  clearEventSettings: () => void;
  mainNotification: MainNotification | null;
  setMainNotification: (message: MainNotification | null) => void;
}

const useEventStore = create<EventStore>(set => ({
  eventStartTime: null,
  eventEndTime: null,
  mainNotification: null,
  setMainNotification: (message: MainNotification | null) => {
    set({ mainNotification: message });
  },

  setEventSettings: (settings: EventSettings) => {
    const eventStartTime = parseInt(settings.event_start_time) || null;
    const eventEndTime = parseInt(settings.event_end_time) || null;

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

export default useEventStore;
