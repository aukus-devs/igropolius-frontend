import { GameLengthToBuildingType } from "@/lib/constants";
import { BuildingData, PlayerData } from "@/types";
import { createTimeline } from "animejs";
import { create } from "zustand";
import useModelsStore from "./modelsStore";
import useDiceStore from "./diceStore";
import useCameraStore from "./cameraStore";
import { calculatePlayerPosition, getSectorRotation } from "@/components/map/utils";
import { SectorsById, sectorsData } from "@/lib/mockData";
import { Euler, Quaternion } from "three";

const usePlayerStore = create<{
  myPlayer: PlayerData | null;
  isPlayerMoving: boolean;
  players: PlayerData[];
  buildingsPerSector: Record<number, BuildingData[]>;
  setMyPlayer: (player: PlayerData) => void;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: PlayerData[]) => void;
  moveMyPlayer: () => Promise<void>;
}>((set, get) => ({
  myPlayer: null,
  isPlayerMoving: false,
  players: [],
  buildingsPerSector: {},

  setMyPlayer: (player: PlayerData) => {
    set({ myPlayer: player });
  },

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
    }

    // sort all buildings values by createdAt
    for (const building of Object.values(buildings)) {
      building.sort((a, b) => a.createdAt - b.createdAt);
    }

    set({ players, buildingsPerSector: buildings });
  },

  moveMyPlayer: async () => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let currentSectorId = myPlayer.current_position;
    let currentSector = SectorsById[currentSectorId];
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

      const nextSectorPlayers = get().players.filter((player) => player.current_position === nextSectorId);
      const nextPosition = calculatePlayerPosition(nextSectorPlayers.length, nextSectorPlayers.length, nextSector);
      const currentRotation = getSectorRotation(currentSector.position);
      const nextRotation = getSectorRotation(nextSector.position);

      tl.add(myPlayerModel.position, {
        x: nextPosition[0],
        z: nextPosition[2],
        duration: 700,
        ease: 'linear',
      });

      if (!currentRotation.every((value, index) => value === nextRotation[index])) {
        const targetQuat = new Quaternion().setFromEuler(new Euler(...nextRotation, "XYZ"));

        tl.add({ t: 0 }, {
          t: 1,
          duration: 300,
          ease: 'linear',
          onUpdate: (self) => {
            myPlayerModel.quaternion.rotateTowards(targetQuat, self.progress);
          }
        });
      }

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
