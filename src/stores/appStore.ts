import { SECTOR_OFFSET, SECTOR_WIDTH } from "@/lib/constants";
import { myPlayerData, sectorsData } from "@/lib/mockData";
import { sleep } from "@/lib/utils";
import { PlayerData, SectorData } from "@/types";
import { animate } from "animejs";
import { Group } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { create } from "zustand";

interface AppStore {
  selectedSectorId: number | null;
  myPlayer: (PlayerData & { modelRef?: Group }) | null;
  isPlayerMoving: boolean;
  rolledNumber: number | null;
  selectedSector: SectorData | null;
  setSelectedSectorId: (id: number | null) => void;
  updateMyPlayerSectorId: (id: number) => void;
  updateMyPlayerModelRef: (object3D: Group) => void;
  moveMyPlayer: () => Promise<void>;
}

const useAppStore = create<AppStore>((set, get) => ({
  selectedSectorId: null,
  myPlayer: myPlayerData,
  isPlayerMoving: false,
  rolledNumber: null,
  selectedSector: null,

  setSelectedSectorId: (id) => {
    const selectedSector = sectorsData.find((sector) => sector.id === id) || null;
    set({ selectedSectorId: id, selectedSector });
  },

  updateMyPlayerModelRef: (object3D) => {
    set((state) => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, modelRef: object3D } : null,
    }));
  },

  updateMyPlayerSectorId: (id: number) => {
    set((state) => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, sectorId: id } : null,
    }));
  },

  moveMyPlayer: async () => {
    const randomNumber = randInt(2, 12);
    set({ rolledNumber: randomNumber });

    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    let prevSector = sectorsData.find((s) => s.id === myPlayer.sectorId);

    set({ isPlayerMoving: true });

    for (let i = 0; i < randomNumber; i++) {
      if (!prevSector) throw new Error(`Previous sector not found.`);

      const prevSectorId = prevSector.id;
      const nextSectorId = prevSectorId + 1 > sectorsData.length ? 1 : prevSectorId + 1;
      const nextSector = sectorsData.find((s) => s.id === nextSectorId);

      if (!prevSector || !nextSector)
        throw new Error(`Failed to find path from ${prevSector.id} to ${nextSector?.id}.`);

      if (!myPlayer?.modelRef) throw new Error(`myPlayer.modelRef is not defined.`);

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

      animate(myPlayer.modelRef.position, {
        x: nextX + offsetX,
        z: nextY + offsetY,
        duration: 500,
      });

      await sleep(500);

      prevSector = nextSector;
    }

    if (!prevSector) throw new Error(`Previous sector not found.`);
    myPlayer.sectorId = prevSector.id;

    set({ isPlayerMoving: false, myPlayer });
  },
}));

export default useAppStore;
