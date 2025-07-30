import { create } from 'zustand';

const useAdminStore = create<{
  actingUserId: number | null;
  setActingUserId: (userId: number | null) => void;
}>((set, _get) => ({
  showAdminPanel: false,
  actingUserId: null,

  setActingUserId: (userId: number | null) => set({ actingUserId: userId }),
}));

export default useAdminStore;
