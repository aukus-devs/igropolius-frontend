import {
  GameLengthToBuildingType,
  IncomeScoreMultiplier,
  IS_DEV,
  ScoreByGameLength,
  TaxScoreMultiplier,
} from '@/lib/constants';
import {
  BackendPlayerData,
  BonusCardType,
  BuildingData,
  MoveMyPlayerParams,
  PlayerData,
  PlayerStateAction,
  PlayerTurnState,
  TaxData,
  TaxType,
} from '@/lib/types';
import { createTimeline } from 'animejs';
import { create } from 'zustand';
import useModelsStore from './modelsStore';
import useCameraStore from './cameraStore';
import { calculatePlayerPosition, getSectorRotation } from '@/components/map/utils';
import { playersFrontendData, SectorsById, sectorsData } from '@/lib/mockData';
import { Euler, Quaternion } from 'three';
import { getNextTurnState } from '@/lib/utils';
import {
  giveBonusCard,
  makePlayerMove,
  payTaxes,
  saveTurnState,
  stealBonusCard as stealBonusCardApi,
} from '@/lib/api';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';

const usePlayerStore = create<{
  myPlayerId: number | null;
  myPlayer: PlayerData | null;
  isPlayerMoving: boolean;
  players: PlayerData[];
  buildingsPerSector: Record<number, BuildingData[]>;
  taxPerSector: Record<number, TaxData>;
  turnState: PlayerTurnState | null;
  setMyPlayerId: (id?: number) => void;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: BackendPlayerData[]) => void;
  animatePlayerMovement: ({ steps }: { steps: number }) => Promise<number>;
  moveMyPlayer: (params: MoveMyPlayerParams) => Promise<void>;
  setTurnState: (turnState: PlayerTurnState | null) => void;
  setNextTurnState: (params: {
    prevSectorId?: number;
    action?: PlayerStateAction;
  }) => Promise<void>;
  receiveBonusCard: (type: BonusCardType) => void;
  stealBonusCard: (player: PlayerData, card: BonusCardType) => Promise<void>;
  moveMyPlayerToPrison: (sectorId: number) => Promise<void>;
  payTaxesAndSwitchState: (type: TaxType) => Promise<void>;
}>((set, get) => ({
  myPlayerId: null,
  myPlayer: null,
  isPlayerMoving: false,
  players: [],
  buildingsPerSector: {},
  taxPerSector: {},
  turnState: null,

  setMyPlayerId: (id?: number) => {
    const { players, myPlayer } = get();
    if (myPlayer?.id !== id) {
      const myPlayerNew = players.find(player => player.id === id) ?? null;
      set({ myPlayer: myPlayerNew });
    }
    set({ myPlayerId: id });
  },

  setNextTurnState: async (params: { prevSectorId?: number; action?: PlayerStateAction }) => {
    const { myPlayer, turnState } = get();
    if (!myPlayer || !turnState) return;

    const mapCompleted = Boolean(params.prevSectorId && myPlayer.sector_id < params.prevSectorId);

    const nextTurnState = getNextTurnState({
      player: myPlayer,
      currentState: turnState,
      mapCompleted,
      action: params.action,
    });

    if (
      mapCompleted &&
      nextTurnState !== 'using-map-tax-bonuses' &&
      nextTurnState !== 'using-map-tax-bonuses-after-train-ride'
    ) {
      await payTaxes('map-tax');
    }

    if (turnState === 'rolling-dice' && nextTurnState === 'filling-game-review') {
      const currentSector = SectorsById[myPlayer.sector_id];
      if (currentSector.type === 'property' || currentSector.type === 'railroad') {
        await payTaxes('street-tax');
      }
    }

    await saveTurnState(nextTurnState);
    resetCurrentPlayerQuery();
    resetPlayersQuery();
  },

  updateMyPlayerSectorId: (id: number) => {
    const currentSector = SectorsById[id];
    if (!currentSector) return;

    set(state => ({
      myPlayer: state.myPlayer ? { ...state.myPlayer, sector_id: id } : null,
    }));
  },

  setPlayers: (playersData: BackendPlayerData[]) => {
    const buildings: Record<number, BuildingData[]> = {};
    const taxPerSector: Record<number, TaxData> = {};
    for (const sector of sectorsData) {
      if (sector.type === 'property' || sector.type === 'railroad') {
        buildings[sector.id] = [];
        taxPerSector[sector.id] = {
          taxAmount: 0,
          playerIncomes: {},
        };
      }
    }

    const players: PlayerData[] = playersData.map(playerData => {
      const frontendData = playersFrontendData[playerData.username] ?? {
        color: 'white',
      };

      return {
        ...playerData,
        ...frontendData,
      };
    });

    const { myPlayer, myPlayerId } = get();
    if (myPlayer?.id !== myPlayerId) {
      const myPlayerNew = players.find(player => player.id === myPlayerId) ?? null;
      set({ myPlayer: myPlayerNew });
    }

    for (const player of players) {
      for (const building of player.games) {
        const sector = SectorsById[building.sector_id];
        if (!sector || (sector.type !== 'property' && sector.type !== 'railroad')) {
          continue;
        }

        const buildingData = {
          type: GameLengthToBuildingType[building.length],
          owner: player,
          sectorId: building.sector_id,
          createdAt: building.created_at,
          gameLength: building.length,
          gameTitle: building.title,
        };

        buildings[building.sector_id].push(buildingData);

        if (buildingData.gameLength === 'drop' || player.id === myPlayerId) {
          continue;
        }

        // Calculate tax data for sectors
        const taxData = taxPerSector[buildingData.sectorId];
        const playerIncomes = taxData.playerIncomes;
        if (!playerIncomes[player.id]) {
          playerIncomes[player.id] = 0;
        }
        const income = ScoreByGameLength[buildingData.gameLength] * IncomeScoreMultiplier;
        playerIncomes[player.id] += income;
        taxData.taxAmount += income * TaxScoreMultiplier;
      }
    }

    // sort all buildings values by createdAt
    for (const building of Object.values(buildings)) {
      building.sort((a, b) => a.createdAt - b.createdAt);
    }

    players.sort((a, b) => {
      return b.total_score - a.total_score;
    });

    set({ players, buildingsPerSector: buildings, taxPerSector });
  },

  animatePlayerMovement: async ({ steps }: { steps: number }) => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let currentSectorId = myPlayer.sector_id;
    let currentSector = SectorsById[currentSectorId];
    if (!currentSector) throw new Error(`Current sector not found.`);

    set({ isPlayerMoving: true });

    const { isOrthographic, cameraToPlayer, moveToPlayer, rotateAroundPlayer } =
      useCameraStore.getState();

    if (!isOrthographic) {
      await cameraToPlayer(myPlayer.id);
    }

    const tl = createTimeline();

    const backward = steps < 0;

    for (let i = 0; i < Math.abs(steps); i++) {
      const nextSectorIdRaw = backward ? currentSectorId - 1 : currentSectorId + 1;
      const nextSectorId = nextSectorIdRaw > sectorsData.length ? 1 : nextSectorIdRaw;
      const nextSector = sectorsData.find(sector => sector.id === nextSectorId);
      if (!nextSector)
        throw new Error(`Failed to find path from ${currentSectorId} to ${nextSectorId}.`);

      const nextSectorPlayers = get().players.filter(player => player.sector_id === nextSectorId);
      const nextPosition = calculatePlayerPosition(
        nextSectorPlayers.length,
        nextSectorPlayers.length,
        nextSector
      );
      const currentRotation = getSectorRotation(currentSector.position);
      const nextRotation = getSectorRotation(nextSector.position);

      tl.add(myPlayerModel.position, {
        x: nextPosition[0],
        y: [myPlayerModel.position.y, myPlayerModel.position.y + 3, myPlayerModel.position.y],
        z: nextPosition[2],
        ease: 'inOutSine',
        duration: IS_DEV ? 100 : 500,
        onUpdate: () => {
          moveToPlayer(myPlayerModel, false);
        },
      });

      if (!currentRotation.every((value, index) => value === nextRotation[index])) {
        const targetQuat = new Quaternion().setFromEuler(new Euler(...nextRotation, 'XYZ'));

        tl.add(
          { t: 0 },
          {
            t: 1,
            duration: 300,
            ease: 'linear',
            onUpdate: self => {
              rotateAroundPlayer(myPlayerModel, false);
              myPlayerModel.quaternion.rotateTowards(targetQuat, self.progress);
            },
          }
        );
      }

      currentSectorId = nextSectorId;
      currentSector = nextSector;
    }

    await new Promise(resolve => {
      tl.play().then(() => {
        set({ isPlayerMoving: false });
        const { updateMyPlayerSectorId } = get();
        updateMyPlayerSectorId(currentSectorId);
        resolve(true);
      });
    });
    return currentSectorId;
  },

  moveMyPlayer: async (params: MoveMyPlayerParams) => {
    const { myPlayer, animatePlayerMovement, setNextTurnState } = get();
    const originalSector = myPlayer?.sector_id;
    await makePlayerMove({
      type: 'dice-roll',
      selected_die: params.selectedDie,
      adjust_by_1: params.adjustBy1,
    });

    // remove used cards from player
    // set(state => ({
    //   myPlayer: state.myPlayer
    //     ? {
    //         ...state.myPlayer,
    //         bonus_cards: state.myPlayer.bonus_cards.filter(card => {
    //           if (params.adjustBy1 !== null && card.bonus_type === 'adjust-roll-by1') {
    //             return false;
    //           }
    //           if (params.selectedDie !== null && card.bonus_type === 'choose-1-die') {
    //             return false;
    //           }
    //           return true;
    //         }),
    //       }
    //     : null,
    // }));

    await animatePlayerMovement({ steps: params.totalRoll });
    await setNextTurnState({ prevSectorId: originalSector, action: params.action });
  },

  moveMyPlayerToPrison: async (sectorId: number) => {
    const { myPlayer, animatePlayerMovement } = get();
    if (!myPlayer) return;

    const steps = sectorId - myPlayer.sector_id;
    await animatePlayerMovement({ steps });
  },

  setTurnState: (turnState: PlayerTurnState | null) => set({ turnState }),

  receiveBonusCard: async (type: BonusCardType) => {
    const { setNextTurnState } = get();
    const newCard = await giveBonusCard(type);

    // add card to player before updating turn state
    set(state => ({
      myPlayer: state.myPlayer
        ? { ...state.myPlayer, bonus_cards: [...state.myPlayer.bonus_cards, newCard] }
        : null,
    }));
    resetPlayersQuery();
    await setNextTurnState({});
  },

  stealBonusCard: async (player: PlayerData, card: BonusCardType) => {
    const { setNextTurnState } = get();
    await stealBonusCardApi(player.id, card);
    await setNextTurnState({});
  },

  payTaxesAndSwitchState: async (type: TaxType) => {
    await payTaxes(type);
    const { setNextTurnState } = get();
    setNextTurnState({ action: 'skip-bonus' });
  },
}));

export default usePlayerStore;
