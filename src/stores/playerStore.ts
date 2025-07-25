import {
  GameLengthToBuildingType,
  IncomeScoreMultiplier,
  IS_DEV,
  ScoreByGameLength,
  TaxScoreMultiplier,
} from '@/lib/constants';
import {
  BuildingData,
  MoveMyPlayerParams,
  PlayerData,
  PlayerStateAction,
  TaxData,
} from '@/lib/types';
import { createTimeline } from 'animejs';
import { create } from 'zustand';
import useModelsStore from './modelsStore';
import useCameraStore from './cameraStore';
import {
  calculatePlayerPosition,
  canBuildOnSector,
  getSectorRotation,
} from '@/components/map/utils';
import { playersFrontendData, SectorsById, sectorsData } from '@/lib/mockData';
import { Euler, Quaternion } from 'three';
import { getNextTurnState } from '@/lib/utils';
import {
  giveBonusCard,
  dropBonusCard,
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
import {
  ActiveBonusCard,
  CurrentUserResponse,
  MainBonusCardType,
  PlayerDetails,
  PlayerTurnState,
  TaxType,
} from '@/lib/api-types-generated';
import useTrainsStore from './trainStore';

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
  prisonCards: ActiveBonusCard[];
  setMyPlayer: (data?: CurrentUserResponse) => void;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: PlayerDetails[]) => void;
  animatePlayerMovement: (playerId: number, steps: number) => Promise<number>;
  moveMyPlayer: (params: MoveMyPlayerParams) => Promise<void>;
  setTurnState: (turnState: PlayerTurnState | null) => void;
  setNextTurnState: (params: {
    prevSectorId?: number;
    action?: PlayerStateAction;
  }) => Promise<void>;
  receiveBonusCard: (type: MainBonusCardType, switchState?: boolean) => Promise<void>;
  dropBonusCard: (type: MainBonusCardType) => Promise<void>;
  stealBonusCard: (player: PlayerData, card: MainBonusCardType) => Promise<void>;
  moveMyPlayerToPrison: () => Promise<void>;
  payTaxesAndSwitchState: (type: TaxType) => Promise<void>;
  canSelectBuildingSector: () => boolean;
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
  prisonCards: [],

  setMyPlayer: (data?: CurrentUserResponse) => {
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

    if (mapCompleted && nextTurnState !== 'using-map-tax-bonuses') {
      await payTaxes({ tax_type: 'map-tax' });
    }

    if (turnState === 'using-dice-bonuses' && nextTurnState === 'filling-game-review') {
      const currentSector = SectorsById[myPlayer.sector_id];
      if (canBuildOnSector(currentSector.type)) {
        await payTaxes({ tax_type: 'street-tax' });
      }
    }

    await saveTurnState({ turn_state: nextTurnState });
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

  setPlayers: async (playersData: PlayerDetails[]) => {
    const buildings: Record<number, BuildingData[]> = {};
    const taxPerSector: Record<number, TaxData> = {};
    for (const sector of sectorsData) {
      if (canBuildOnSector(sector.type)) {
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

    const prevPlayers = get().players;

    await Promise.all(
      players.map(async player => {
        if (player.id === myPlayerId) {
          return;
        }
        const prevPlayer = prevPlayers.find(p => p.id === player.id);

        if (prevPlayer && player.sector_id !== prevPlayer.sector_id) {
          const mapLength = sectorsData.length;
          const positionDiff = player.sector_id - prevPlayer.sector_id;
          const steps = (positionDiff + mapLength) % mapLength;

          await get().animatePlayerMovement(player.id, steps);
        }
      })
    );

    set({
      players,
      buildingsPerSector: buildings,
      taxPerSector,
      prisonCards: prisonPlayer?.bonus_cards ?? [],
    });
  },

  animatePlayerMovement: async (playerId, steps) => {
    const player = get().players.find(p => p.id === playerId);
    if (!player) throw new Error(`Player not found.`);

    const playerModel = useModelsStore.getState().getPlayerModel(player.id);
    if (!playerModel) throw new Error(`Player model not found.`);

    let currentSectorId = player.sector_id;
    let currentSector = SectorsById[currentSectorId];
    if (!currentSector) throw new Error(`Current sector not found.`);

    if (steps === 0) {
      return currentSectorId;
    }

    const isMyPlayer = player.id === get().myPlayerId;

    const { isOrthographic, cameraToPlayer, moveToPlayer, rotateAroundPlayer } =
      useCameraStore.getState();

    if (!isOrthographic && isMyPlayer) {
      await cameraToPlayer(player.id);
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

      tl.add(playerModel.position, {
        x: nextPosition[0],
        y: [playerModel.position.y, playerModel.position.y + 3, playerModel.position.y],
        z: nextPosition[2],
        ease: 'inOutSine',
        duration: IS_DEV ? 100 : 500,
        onUpdate: () => {
          if (isMyPlayer) {
            moveToPlayer(playerModel, false);
          }
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
              if (isMyPlayer) {
                rotateAroundPlayer(playerModel, false);
              }
              playerModel.quaternion.rotateTowards(targetQuat, self.progress);
            },
          }
        );
      }

      currentSectorId = nextSectorId;
      currentSector = nextSector;
    }

    await new Promise(resolve => {
      tl.play().then(() => resolve(true));
    });
    return currentSectorId;
  },

  moveMyPlayer: async (params: MoveMyPlayerParams) => {
    const { myPlayer, animatePlayerMovement, setNextTurnState } = get();
    if (!myPlayer) {
      throw new Error('My player not found.');
    }

    const originalSector = myPlayer.sector_id;

    set({ isPlayerMoving: true });
    await makePlayerMove({
      type: 'dice-roll',
      selected_die: params.selectedDie,
      adjust_by_1: params.adjustBy1,
      ride_train: params.rideTrain,
    });

    if (params.rideTrain) {
      const destination = await useTrainsStore.getState().rideTrain(myPlayer.sector_id);
      set(state => ({
        myPlayer: state.myPlayer ? { ...state.myPlayer, sector_id: destination } : null,
      }));
    }

    await animatePlayerMovement(myPlayer.id, params.totalRoll);
    get().updateMyPlayerSectorId(originalSector + params.totalRoll);
    await setNextTurnState({ prevSectorId: originalSector, action: params.action });
    set({ isPlayerMoving: false });

    resetNotificationsQuery();
  },

  moveMyPlayerToPrison: async () => {
    const { myPlayer, animatePlayerMovement } = get();
    if (!myPlayer) return;

    const prisonSectors = [11, 31];
    const sectorId = prisonSectors.reduce((prev, curr) =>
      Math.abs(curr - myPlayer.sector_id) < Math.abs(prev - myPlayer.sector_id) ? curr : prev
    );

    const steps = sectorId - myPlayer.sector_id;
    await animatePlayerMovement(myPlayer.id, steps);
    get().updateMyPlayerSectorId(sectorId);
  },

  setTurnState: (turnState: PlayerTurnState | null) => set({ turnState }),

  receiveBonusCard: async (type: MainBonusCardType, switchState: boolean = true) => {
    const { setNextTurnState } = get();
    const newCard = await giveBonusCard({ bonus_type: type });

    // add card to player before updating turn state
    set(state => ({
      myPlayer: state.myPlayer
        ? { ...state.myPlayer, bonus_cards: [...state.myPlayer.bonus_cards, newCard] }
        : null,
    }));

    if (switchState) {
      await setNextTurnState({});
    }
    resetPlayersQuery();
    resetNotificationsQuery();
  },

  dropBonusCard: async (type: MainBonusCardType) => {
    const { setNextTurnState } = get();
    await dropBonusCard({ bonus_type: type });

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

  stealBonusCard: async (player: PlayerData, card: MainBonusCardType) => {
    const { setNextTurnState } = get();
    await stealBonusCardApi({ player_id: player.id, bonus_type: card });
    resetNotificationsQuery();
    await setNextTurnState({});
  },

  payTaxesAndSwitchState: async (type: TaxType) => {
    await payTaxes({ tax_type: type });
    resetNotificationsQuery();
    const { setNextTurnState } = get();
    setNextTurnState({ action: 'skip-bonus' });
  },

  canSelectBuildingSector: () => {
    const { turnState, myPlayer } = get();
    return turnState === 'filling-game-review' && myPlayer?.sector_id === 1;
  },
}));

export default usePlayerStore;
