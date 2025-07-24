import { create } from 'zustand';

export interface EventSettings {
    event_start_time: string;
    event_end_time: string;
}

interface EventStore {
    eventStartTime: number | null;
    eventEndTime: number | null;
    setEventSettings: (settings: EventSettings) => void;
    clearEventSettings: () => void;
}

const useEventStore = create<EventStore>((set) => ({
    eventStartTime: null,
    eventEndTime: null,

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