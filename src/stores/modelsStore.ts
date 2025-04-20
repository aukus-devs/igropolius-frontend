import { create } from "zustand";
import { Group } from "three";

const useModelsStore = create<{
  playersModels: { [key: number]: Group };
  sectorsModels: { [key: number]: Group };
  addPlayerModel: (id: number, object3D: Group) => void;
  getPlayerModel: (id: number) => Group;
  addSectorModel: (id: number, object3D: Group) => void;
  getSectorModel: (id: number) => Group;
}>((set, get) => ({
  playersModels: {},
  sectorsModels: {},

  getSectorModel: (id) => get().sectorsModels[id],

  addSectorModel: (id, object3D) =>
    set((state) => ({
      sectorsModels: { ...state.sectorsModels, [id]: object3D },
    })),

  getPlayerModel: (id) => get().playersModels[id],

  addPlayerModel: (id, object3D) =>
    set((state) => ({
      playersModels: { ...state.playersModels, [id]: object3D },
    })),
}));

export default useModelsStore;
