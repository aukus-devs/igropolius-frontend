import { create } from 'zustand';

const useAdminStore = create<{
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  actingUserId: number | null;
  setActingUserId: (userId: number | null) => void;
}>((set, _get) => ({
  showAdminPanel: false,
  actingUserId: null,

  setShowAdminPanel: (show: boolean) => set({ showAdminPanel: show }),
  setActingUserId: (userId: number | null) => set({ actingUserId: userId }),
}));

export default useAdminStore;
