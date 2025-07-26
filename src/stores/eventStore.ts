import { Settings as EventSettings } from '@/lib/api-types-generated';
import { create } from 'zustand';

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

export default useEventStore;
