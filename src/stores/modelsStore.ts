import { create } from "zustand";
import { Group } from "three";

const useModelsStore = create<{
  playersModels: { [key: number]: Group };
  sectorsModels: { [key: number]: Group };
  addPlayerModel: (object3D: Group) => void;
  getPlayerModel: (id: number) => Group;
  addSectorModel: (object3D: Group) => void;
  getSectorModel: (id: number) => Group;
}>((set, get) => ({
  playersModels: {},
  sectorsModels: {},

  getSectorModel: (id) => get().sectorsModels[id],

  addSectorModel: (object3D) =>
    set((state) => ({
      sectorsModels: { ...state.sectorsModels, [object3D.name]: object3D },
    })),

  getPlayerModel: (id) => get().playersModels[id],

  addPlayerModel: (object3D) =>
    set((state) => ({
      playersModels: { ...state.playersModels, [object3D.name]: object3D },
    })),
}));

export default useModelsStore;
