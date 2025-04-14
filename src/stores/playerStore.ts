import { SECTOR_OFFSET, SECTOR_WIDTH } from "@/lib/constants";
import { myPlayerData, sectorsData } from "@/lib/mockData";
import { sleep } from "@/lib/utils";
import { PlayerData } from "@/types";
import { animate } from "animejs";
import { randInt } from "three/src/math/MathUtils.js";
import { create } from "zustand";
import useModelsStore from "./modelsStore";

const usePlayerStore = create<{
  myPlayer: PlayerData | null;
  isPlayerMoving: boolean;
  rolledNumber: number | null;
  updateMyPlayerSectorId: (id: number) => void;
  moveMyPlayer: () => Promise<void>;
}>((set, get) => ({
  myPlayer: myPlayerData,
  isPlayerMoving: false,
  rolledNumber: null,

  updateMyPlayerSectorId: (id: number) => {
    set((state) => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, sectorId: id } : null,
    }));
  },

  moveMyPlayer: async () => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    const randomNumber = randInt(2, 12);
    set({ rolledNumber: randomNumber });

    let currentSectorId = myPlayer.sectorId;
    let currentSector = sectorsData.find((s) => s.id === currentSectorId);
    if (!currentSector) throw new Error(`Current sector not found.`);

    set({ isPlayerMoving: true });

    for (let i = 0; i < randomNumber; i++) {
      const nextSectorId = currentSectorId + 1 > sectorsData.length ? 1 : currentSectorId + 1;
      const nextSector = sectorsData.find((s) => s.id === nextSectorId);
      if (!nextSector) throw new Error(`Failed to find path from ${currentSectorId} to ${nextSectorId}.`);

      const directionX = nextSector.position.x - currentSector.position.x;
      const directionY = nextSector.position.y - currentSector.position.y;
      const nextX = (currentSector.position.x + directionX) * SECTOR_WIDTH;
      const nextY = (currentSector.position.y + directionY) * SECTOR_WIDTH;
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

      currentSectorId = nextSectorId;
      currentSector = nextSector;
    }

    set({
      isPlayerMoving: false,
      myPlayer: {
        ...myPlayer,
        sectorId: currentSectorId,
      },
    });
  },
}));

export default usePlayerStore;
