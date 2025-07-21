import {
  GameLengthToBuildingType,
  IncomeScoreMultiplier,
  IS_DEV,
  ScoreByGameLength,
  TaxScoreMultiplier,
} from '@/lib/constants';
import {
  ActiveBonusCard,
  BackendPlayerData,
  BonusCardType,
  BuildingData,
  MoveMyPlayerParams,
  MyPlayerData,
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
  loseBonusCard,
  makePlayerMove,
  payTaxes,
  saveTurnState,
  stealBonusCard as stealBonusCardApi,
} from '@/lib/api';
import {
  resetCurrentPlayerQuery,
  resetPlayersQuery,
  resetNotificationsQuery,
} from '@/lib/queryClient';

const usePlayerStore = create<{
  myPlayerId: number | null;
  myPlayer: PlayerData | null;
  hasUpgradeBonus: boolean;
  hasDowngradeBonus: boolean;
  isPlayerMoving: boolean;
  players: PlayerData[];
  buildingsPerSector: Record<number, BuildingData[]>;
  taxPerSector: Record<number, TaxData>;
  turnState: PlayerTurnState | null;
  eventEndTime: number | null;
  eventStartTime: number | null;
  prisonCards: ActiveBonusCard[];
  setMyPlayer: (data?: MyPlayerData) => void;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: BackendPlayerData[], eventEndTime?: number, eventStartTime?: number) => void;
  animatePlayerMovement: ({ steps }: { steps: number }) => Promise<number>;
  moveMyPlayer: (params: MoveMyPlayerParams) => Promise<void>;
  setTurnState: (turnState: PlayerTurnState | null) => void;
  setNextTurnState: (params: {
    prevSectorId?: number;
    action?: PlayerStateAction;
  }) => Promise<void>;
  receiveBonusCard: (type: BonusCardType, switchState?: boolean) => Promise<void>;
  dropBonusCard: (type: BonusCardType) => Promise<void>;
  stealBonusCard: (player: PlayerData, card: BonusCardType) => Promise<void>;
  moveMyPlayerToPrison: () => Promise<void>;
  payTaxesAndSwitchState: (type: TaxType) => Promise<void>;
}>((set, get) => ({
  myPlayerId: null,
  myPlayer: null,
  hasUpgradeBonus: false,
  hasDowngradeBonus: false,
  isPlayerMoving: false,
  players: [],
  buildingsPerSector: {},
  taxPerSector: {},
  turnState: null,
  eventEndTime: null,
  eventStartTime: null,
  prisonCards: [],

  setMyPlayer: (data?: MyPlayerData) => {
    if (!data) {
      set({
        myPlayerId: null,
        myPlayer: null,
        hasUpgradeBonus: false,
        hasDowngradeBonus: false,
        turnState: null,
      });
      return;
    }

    const { players, myPlayer } = get();
    if (myPlayer?.id !== data.id) {
      const myPlayerNew = players.find(player => player.id === data.id) ?? null;
      set({ myPlayer: myPlayerNew });
    }
    set({
      myPlayerId: data.id,
      hasUpgradeBonus: data.has_upgrade_bonus,
      hasDowngradeBonus: data.has_downgrade_bonus,
    });
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

  setPlayers: (playersData: BackendPlayerData[], eventEndTime?: number, eventStartTime?: number) => {
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
    const activePlayers = playersData.filter(p => p.role === 'admin' || p.role == 'player');
    const players: PlayerData[] = activePlayers.map(playerData => {
      const frontendData = playersFrontendData[playerData.username] ?? {
        color: 'white',
      };

      return {
        ...playerData,
        ...frontendData,
      };
    });

    const { myPlayerId } = get();
    const myPlayerNew = players.find(player => player.id === myPlayerId) ?? null;
    set({ myPlayer: myPlayerNew });

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

    const prisonPlayer = playersData.find(p => p.role === 'prison');

    set({
      players,
      buildingsPerSector: buildings,
      taxPerSector,
      eventEndTime: eventEndTime ?? null,
      eventStartTime: eventStartTime ?? null,
      prisonCards: prisonPlayer?.bonus_cards ?? [],
    });
  },

  animatePlayerMovement: async ({ steps }: { steps: number }) => {
    const { myPlayer } = get();
    if (!myPlayer) throw new Error(`Player not found.`);

    const myPlayerModel = useModelsStore.getState().getPlayerModel(myPlayer.id);
    if (!myPlayerModel) throw new Error(`Player model not found.`);

    let currentSectorId = myPlayer.sector_id;
    let currentSector = SectorsById[currentSectorId];
    if (!currentSector) throw new Error(`Current sector not found.`);

    if (steps === 0) {
      return currentSectorId;
    }

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
    resetNotificationsQuery();
  },

  moveMyPlayerToPrison: async () => {
    const { myPlayer, animatePlayerMovement } = get();
    if (!myPlayer) return;

    // if (!sectorId) {
    const prisonSectors = [11, 31];
    const sectorId = prisonSectors.reduce((prev, curr) =>
      Math.abs(curr - myPlayer.sector_id) < Math.abs(prev - myPlayer.sector_id) ? curr : prev
    );
    // }

    const steps = sectorId - myPlayer.sector_id;
    await animatePlayerMovement({ steps });
  },

  setTurnState: (turnState: PlayerTurnState | null) => set({ turnState }),

  receiveBonusCard: async (type: BonusCardType, switchState: boolean = true) => {
    const { setNextTurnState } = get();
    const newCard = await giveBonusCard(type);

    // add card to player before updating turn state
    set(state => ({
      myPlayer: state.myPlayer
        ? { ...state.myPlayer, bonus_cards: [...state.myPlayer.bonus_cards, newCard] }
        : null,
    }));
    resetPlayersQuery();
    resetNotificationsQuery();

    if (switchState) {
      await setNextTurnState({});
    }
  },

  dropBonusCard: async (type: BonusCardType) => {
    const { setNextTurnState } = get();
    await loseBonusCard(type);

    // remove card from player before updating turn state
    set(state => ({
      myPlayer: state.myPlayer
        ? {
            ...state.myPlayer,
            bonus_cards: state.myPlayer.bonus_cards.filter(card => card.bonus_type !== type),
          }
        : null,
    }));
    resetPlayersQuery();
    resetNotificationsQuery();
    await setNextTurnState({});
  },

  stealBonusCard: async (player: PlayerData, card: BonusCardType) => {
    const { setNextTurnState } = get();
    await stealBonusCardApi(player.id, card);
    resetNotificationsQuery();
    await setNextTurnState({});
  },

  payTaxesAndSwitchState: async (type: TaxType) => {
    await payTaxes(type);
    resetNotificationsQuery();
    const { setNextTurnState } = get();
    setNextTurnState({ action: 'skip-bonus' });
  },

  // loseBonusCard: async (type: BonusCardType) => {
  //   await loseBonusCardApi(type);
  //   resetPlayersQuery();
  //   const { setNextTurnState } = get();
  //   setNextTurnState({});
  // },
}));

export default usePlayerStore;
