import { GameLengthToBuildingType, SECTOR_OFFSET, SECTOR_WIDTH } from "@/lib/constants";
import { myPlayerData, sectorsData } from "@/lib/mockData";
import { BuildingData, PlayerData } from "@/types";
import { createTimeline } from "animejs";
import { create } from "zustand";
import useModelsStore from "./modelsStore";
import useDiceStore from "./diceStore";
import useCameraStore from "./cameraStore";

const usePlayerStore = create<{
  myPlayer: PlayerData | null;
  isPlayerMoving: boolean;
  players: PlayerData[];
  buildingsPerSector: Record<number, BuildingData[]>;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: PlayerData[]) => void;
  moveMyPlayer: () => Promise<void>;
  getBuildings: (sectorId: number) => BuildingData[];
}>((set, get) => ({
  myPlayer: myPlayerData,
  isPlayerMoving: false,
  players: [],
  buildingsPerSector: {},

  updateMyPlayerSectorId: (id: number) => {
    set((state) => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, current_position: id } : null,
    }));
  },

  setPlayers: (players: PlayerData[]) => {
    const buildings: Record<number, BuildingData[]> = {};

    for (const player of players) {
      for (const building of player.sector_ownership) {
        if (!buildings[building.sector_id]) {
          buildings[building.sector_id] = [];
        }

        buildings[building.sector_id].push({
          type: GameLengthToBuildingType[building.game_length],
          owner: player,
          sectorId: building.sector_id,
          createdAt: building.created_at,
          gameLength: building.game_length,
          gameTitle: building.game_title,
        });
      }
    };

    // sort all buildings values by createdAt
    for (const building of Object.values(buildings)) {
      building.sort((a, b) => a.createdAt - b.createdAt);
    }

    set({ players, buildingsPerSector: buildings });
  },

  getBuildings: (sectorId: number) => {
    const buildings = get().buildingsPerSector[sectorId];
    return buildings || [];
  },

  moveMyPlayer: async () => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let currentSectorId = myPlayer.current_position;
    let currentSector = sectorsData.find((sector) => sector.id === currentSectorId);
    if (!currentSector) throw new Error(`Current sector not found.`);

    set({ isPlayerMoving: true });

    await useCameraStore.getState().cameraToPlayer(currentSectorId);
    const rolledNumber = await useDiceStore.getState().rollDice();

    const tl = createTimeline();

    for (let i = 0; i < rolledNumber; i++) {
      const nextSectorId = currentSectorId + 1 > sectorsData.length ? 1 : currentSectorId + 1;
      const nextSector = sectorsData.find((sector) => sector.id === nextSectorId);
      if (!nextSector)
        throw new Error(`Failed to find path from ${currentSectorId} to ${nextSectorId}.`);

      const directionX = nextSector.position.x - currentSector.position.x;
      const directionY = nextSector.position.y - currentSector.position.y;
      const nextX = (currentSector.position.x + directionX) * SECTOR_WIDTH;
      const nextY = (currentSector.position.y + directionY) * SECTOR_WIDTH;
      const offsetX =
        nextSector.position.x === 0
          ? -SECTOR_OFFSET * 2.5
          : nextSector.position.x === 10
            ? SECTOR_OFFSET * 2.5
            : 0;
      const offsetY =
        nextSector.position.y === 0
          ? -SECTOR_OFFSET * 2.5
          : nextSector.position.y === 10
            ? SECTOR_OFFSET * 2.5
            : 0;

      tl.add(myPlayerModel.position, {
        x: nextX + offsetX,
        y: [myPlayerModel.position.y, myPlayerModel.position.y + 1.5, myPlayerModel.position.y],
        z: nextY + offsetY,
        duration: 500,
      });

      currentSectorId = nextSectorId;
      currentSector = nextSector;
    }

    tl.play().then(() => {
      set({ isPlayerMoving: false });
      get().updateMyPlayerSectorId(currentSectorId);
    });
  },
}));

export default usePlayerStore;
