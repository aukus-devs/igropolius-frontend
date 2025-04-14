import { SECTOR_OFFSET, SECTOR_WIDTH } from "@/lib/constants";
import { myPlayerData, sectorsData } from "@/lib/mockData";
import { sleep } from "@/lib/utils";
import { PlayerData, SectorData } from "@/types";
import { animate } from "animejs";
import CameraControls from "camera-controls";
import { Group } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { create } from "zustand";

interface AppStore {
  selectedSectorId: number | null;
  myPlayer: PlayerData | null;
  isPlayerMoving: boolean;
  rolledNumber: number | null;
  selectedSector: SectorData | null;
  cameraControls: CameraControls | null;
  playersModels: { [key: string]: Group };
  sectorsModels: { [key: string]: Group };
  setSelectedSectorId: (id: number | null) => void;
  updateMyPlayerSectorId: (id: number) => void;
  moveMyPlayer: () => Promise<void>;
  setCameraControls: (controls: CameraControls) => void;
  addPlayerModel: (object3D: Group) => void;
  getPlayerModel: (id: string) => Group;
  addSectorModel: (object3D: Group) => void;
  getSectorModel: (id: number) => Group;
}

const useAppStore = create<AppStore>((set, get) => ({
  selectedSectorId: null,
  myPlayer: myPlayerData,
  isPlayerMoving: false,
  rolledNumber: null,
  selectedSector: null,
  cameraControls: null,
  playersModels: {},
  sectorsModels: {},

  getSectorModel: (id) => get().sectorsModels[`sector_${id}`],

  addSectorModel: (object3D) => set((state) => ({
    sectorsModels: { ...state.sectorsModels, [object3D.name]: object3D }
  })),

  getPlayerModel: (id) => get().playersModels[id],

  addPlayerModel: (object3D) => set((state) => ({
    playersModels: { ...state.playersModels, [object3D.name]: object3D }
  })),

  setCameraControls: (controls) => set({ cameraControls: controls }),

  setSelectedSectorId: (id) => {
    const selectedSector = sectorsData.find((sector) => sector.id === id) || null;
    set({ selectedSectorId: id, selectedSector });
  },

  updateMyPlayerSectorId: (id: number) => {
    set((state) => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, sectorId: id } : null,
    }));
  },

  moveMyPlayer: async () => {
    const randomNumber = randInt(2, 12);
    set({ rolledNumber: randomNumber });

    const { myPlayer, getPlayerModel } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let prevSector = sectorsData.find((s) => s.id === myPlayer.sectorId);

    set({ isPlayerMoving: true });

    for (let i = 0; i < randomNumber; i++) {
      if (!prevSector) throw new Error(`Previous sector not found.`);

      const prevSectorId = prevSector.id;
      const nextSectorId = prevSectorId + 1 > sectorsData.length ? 1 : prevSectorId + 1;
      const nextSector = sectorsData.find((s) => s.id === nextSectorId);

      if (!prevSector || !nextSector)
        throw new Error(`Failed to find path from ${prevSector.id} to ${nextSector?.id}.`);

      if (!myPlayerModel) throw new Error(`myPlayer.modelRef is not defined.`);

      const directionX = nextSector.position.x - prevSector.position.x;
      const directionY = nextSector.position.y - prevSector.position.y;
      const nextX = (prevSector.position.x + directionX) * SECTOR_WIDTH;
      const nextY = (prevSector.position.y + directionY) * SECTOR_WIDTH;
      const offsetX =
        nextSector.position.x === 0
          ? -SECTOR_OFFSET * 2
          : nextSector.position.x === 10
            ? SECTOR_OFFSET * 2
            : 0;
      const offsetY =
        nextSector.position.y === 0
          ? -SECTOR_OFFSET * 2
          : nextSector.position.y === 10
            ? SECTOR_OFFSET * 2
            : 0;

      animate(myPlayerModel.position, {
        x: nextX + offsetX,
        z: nextY + offsetY,
        duration: 500,
      });

      await sleep(500);

      prevSector = nextSector;
    }

    if (!prevSector) throw new Error(`Previous sector not found.`);

    set({
      isPlayerMoving: false,
      myPlayer: {
        ...myPlayer,
        sectorId: prevSector.id,
      },
    });
  },
}));

export default useAppStore;
