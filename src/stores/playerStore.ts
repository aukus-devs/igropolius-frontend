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
  updateMyPlayerSectorId: (id: number) => void;
  moveMyPlayer: () => Promise<void>;
  players: PlayerData[];
  setPlayers: (players: PlayerData[]) => void;
  buildingsPerSector: Record<number, BuildingData[]>;
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
    const buildings = players.reduce((acc: { [k: number]: BuildingData[] }, player) => {
      player.sector_ownership.forEach((item) => {
        if (!acc[item.sector_id]) {
          acc[item.sector_id] = [];
        }
        acc[item.sector_id].push({
          type: GameLengthToBuildingType[item.game_length],
          owner: player,
          sectorId: item.sector_id,
          createdAt: item.created_at,
          gameLength: item.game_length,
          gameTitle: item.game_title,
        });
      });
      return acc;
    }, {});

    // sort all buildings values by createdAt
    Object.values(buildings).forEach((sectorBuildings) => {
      sectorBuildings.sort((a, b) => {
        if (a.createdAt < b.createdAt) return -1;
        if (a.createdAt > b.createdAt) return 1;
        return 0;
      });
    });

    set({ players, buildingsPerSector: buildings });
  },

  moveMyPlayer: async () => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const cameraToPlayer = useCameraStore.getState().cameraToPlayer;
    if (!cameraToPlayer) throw new Error(`Camera not found.`);
    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let currentSectorId = myPlayer.current_position;
    let currentSector = sectorsData.find((s) => s.id === currentSectorId);
    if (!currentSector) throw new Error(`Current sector not found.`);

    set({ isPlayerMoving: true });

    await cameraToPlayer(currentSectorId);

    const rolledNumber = await useDiceStore.getState().rollDice();

    const tl = createTimeline();

    for (let i = 0; i < rolledNumber; i++) {
      const nextSectorId = currentSectorId + 1 > sectorsData.length ? 1 : currentSectorId + 1;
      const nextSector = sectorsData.find((s) => s.id === nextSectorId);
      if (!nextSector)
        throw new Error(`Failed to find path from ${currentSectorId} to ${nextSectorId}.`);

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

      tl.add(myPlayerModel.position, {
        x: nextX + offsetX,
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
