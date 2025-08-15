import {
  GameLengthToBuildingType,
  IncomeScoreGroupOwnerMultiplier,
  IncomeScoreMultiplier,
  IS_DEV,
  ScoreByGameLength,
  TaxScoreMultiplier,
} from '@/lib/constants';
import { BuildingData, MoveMyPlayerParams, PlayerStateAction, TaxData } from '@/lib/types';
import { createTimeline } from 'animejs';
import { create } from 'zustand';
import useModelsStore from './modelsStore';
import useCameraStore from './cameraStore';
import {
  calculatePlayerPositionOnSector,
  canBuildOnSector,
  getPlayerRotationOnSector,
  getSectorRotation,
} from '@/components/map/utils';
import { SectorsById, sectorsData } from '@/lib/mockData';
import { Euler, Quaternion, Vector3 } from 'three';
import {
  getClosestPrison,
  getNextTurnState,
  getSectorsGroup,
  playerOwnsSectorsGroup,
  wasLastMoveDropToPrison,
} from '@/lib/utils';
import {
  dropBonusCard,
  payTaxes,
  saveTurnState,
  stealBonusCard as stealBonusCardApi,
} from '@/lib/api';
import {
  resetCurrentPlayerQuery,
  resetPlayersQuery,
  resetNotificationsQuery,
  refetechPlayersQuery,
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
  myPlayer: PlayerDetails | null;
  isPlayerMoving: boolean;
  players: PlayerDetails[];
  buildingsPerSector: Record<number, BuildingData[]>;
  playersPerSector: Record<number, PlayerDetails[]>;
  newBuildingsIds: number[];
  taxPerSector: Record<number, TaxData>;
  turnState: PlayerTurnState | null;
  prisonCards: MainBonusCardType[];
  setMyPlayer: (data?: CurrentUserResponse) => void;
  updateMyPlayerSectorId: (id: number) => void;
  setPlayers: (players: PlayerDetails[]) => void;
  animatePlayerMovement: (playerId: number, steps: number) => Promise<number>;
  moveMyPlayer: (params: MoveMyPlayerParams) => Promise<void>;
  setTurnState: (turnState: PlayerTurnState | null) => void;
  setNextTurnState: (params: {
    sectorToId?: number;
    action?: PlayerStateAction;
    mapCompleted?: boolean;
    skipUpdate?: boolean;
  }) => Promise<void>;
  stealBonusCard: (player: PlayerDetails, card: MainBonusCardType) => Promise<void>;
  moveMyPlayerToPrison: () => Promise<void>;
  payTaxesAndSwitchState: (type: TaxType) => Promise<void>;
  canSelectBuildingSector: () => boolean;
  removeCardFromState: (type: MainBonusCardType) => void;
  addCardToState: (card: ActiveBonusCard) => void;
  setPrisonCards: (cards: MainBonusCardType[]) => void;
  animateToPrison: (prisonId: number) => Promise<void>;
}>((set, get) => ({
  myPlayerId: null,
  myPlayer: null,
  isPlayerMoving: false,
  players: [],
  buildingsPerSector: {},
  playersPerSector: Object.fromEntries(sectorsData.map(sector => [sector.id, []])) as Record<
    number,
    PlayerDetails[]
  >,
  newBuildingsIds: [],
  taxPerSector: {},
  turnState: null,
  prisonCards: [],

  setMyPlayer: (data?: CurrentUserResponse) => {
    if (!data) {
      set({
        myPlayerId: null,
        myPlayer: null,
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
    });
  },

  setNextTurnState: async (params: {
    sectorToId?: number;
    action?: PlayerStateAction;
    mapCompleted?: boolean;
    skipUpdate?: boolean;
  }) => {
    const { myPlayer, turnState } = get();

    console.log('updating state', params, turnState);

    if (!myPlayer || !turnState) return;

    if (!params.skipUpdate) {
      set({ turnState: null });
    }

    const nextTurnState = getNextTurnState({
      player: myPlayer,
      currentState: turnState,
      mapCompleted: params.mapCompleted ?? false,
      action: params.action,
      sectorToId: params.sectorToId,
    });

    if (params.mapCompleted && nextTurnState !== 'using-map-tax-bonuses') {
      await payTaxes({ tax_type: 'map-tax' });
    }

    if (
      turnState === 'using-dice-bonuses' &&
      nextTurnState === 'filling-game-review' &&
      params.sectorToId
    ) {
      const currentSector = SectorsById[params.sectorToId];
      if (canBuildOnSector(currentSector.type)) {
        await payTaxes({ tax_type: 'street-tax' });
      }
    }

    await saveTurnState({ turn_state: nextTurnState });

    if (!params.skipUpdate) {
      set({ turnState: nextTurnState });
    }
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
    const players = playersData;
    players.forEach(p => (p.color = p.color === '' ? 'white' : p.color));

    const { myPlayerId, buildingsPerSector } = get();
    const myPlayerNew = players.find(player => player.id === myPlayerId) ?? null;
    set({ myPlayer: myPlayerNew });

    const currentBuildingsIds = new Set(
      Object.values(buildingsPerSector).flatMap(b => b.map(b => b.id))
    );
    const allBuildingsIds = playersData
      .flatMap(player => player.games)
      .filter(game => game.status !== 'reroll' && game.sector_id !== 1)
      .map(game => game.id);

    const newBuildingsIds = allBuildingsIds.filter(id => !currentBuildingsIds.has(id));

    for (const player of players) {
      for (const building of player.games) {
        const sector = SectorsById[building.sector_id];
        if (!sector || (sector.type !== 'property' && sector.type !== 'railroad')) {
          continue;
        }
        if (building.status === 'reroll') {
          continue;
        }

        // Calculate tax data for sectors
        const taxData = taxPerSector[building.sector_id];
        const playerIncomes = taxData.playerIncomes;
        if (!playerIncomes[player.id]) {
          playerIncomes[player.id] = 0;
        }

        let incomeMultiplier = IncomeScoreMultiplier;
        const sectorGroup = getSectorsGroup(sector.id);
        let hasGroupBonus = false;
        if (sectorGroup && playerOwnsSectorsGroup(player.games, sectorGroup)) {
          // console.log('group owner', { sectorGroup, player });
          incomeMultiplier = IncomeScoreGroupOwnerMultiplier;
          hasGroupBonus = true;
        }

        const income = ScoreByGameLength[building.length] * incomeMultiplier;

        playerIncomes[player.id] += income;

        const buildingData = {
          id: building.id,
          type: GameLengthToBuildingType[building.length],
          owner: player,
          sectorId: building.sector_id,
          createdAt: building.created_at,
          gameStatus: building.status,
          gameLength: building.length,
          gameTitle: building.title,
          income,
          hasGroupBonus,
        };

        buildings[building.sector_id].push(buildingData);

        if (player.id === myPlayerId) {
          taxData.taxAmount -= income;
        } else {
          taxData.taxAmount += income * TaxScoreMultiplier;
        }
      }
    }

    for (const sector in taxPerSector) {
      const taxData = taxPerSector[sector];
      if (taxData.taxAmount < 0) {
        taxData.taxAmount = 0; // Ensure tax amount is not negative
      }
    }

    // console.log({ taxPerSector });

    // sort all buildings values by createdAt
    for (const building of Object.values(buildings)) {
      building.sort((a, b) => a.createdAt - b.createdAt);
    }

    players.sort((a, b) => {
      return b.total_score - a.total_score;
    });

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
          let steps = (positionDiff + mapLength) % mapLength;
          if (positionDiff < 0) {
            if (wasLastMoveDropToPrison(player)) {
              steps = positionDiff;
            }
          }

          await get().animatePlayerMovement(player.id, steps);
        }
      })
    );

    const playersPerSector = Object.fromEntries(
      sectorsData.map(sector => [
        sector.id,
        players.filter(player => player.sector_id === sector.id).sort((a, b) => a.id - b.id),
      ])
    ) as Record<number, PlayerDetails[]>;

    set({
      players,
      buildingsPerSector: buildings,
      newBuildingsIds,
      playersPerSector,
      taxPerSector,
    });
  },

  animatePlayerMovement: async (playerId, steps) => {
    const { players, myPlayerId, myPlayer } = get();
    const player = playerId === myPlayerId ? myPlayer : players.find(p => p.id === playerId);

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

      const nextPosition = calculatePlayerPositionOnSector(player, nextSector);

      const currentRotation = getPlayerRotationOnSector(currentSector);
      const nextRotation = getPlayerRotationOnSector(nextSector);

      // const currentRotation = getSectorRotation(currentSector.position);
      // const nextRotation = getSectorRotation(nextSector.position);

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
    const { myPlayer } = get();
    if (!myPlayer) {
      throw new Error('My player not found.');
    }

    set({ isPlayerMoving: true });

    if (params.rideTrain) {
      const destination = await useTrainsStore.getState().rideTrain(myPlayer.sector_id);
      set(state => ({
        myPlayer: state.myPlayer ? { ...state.myPlayer, sector_id: destination } : null,
      }));
    }

    const currentSector = get().myPlayer?.sector_id;
    if (!currentSector) {
      throw new Error('Current sector not found.');
    }

    const animationSteps =
      params.sectorTo >= currentSector
        ? params.sectorTo - currentSector
        : params.sectorTo + sectorsData.length - currentSector;

    await get().animatePlayerMovement(myPlayer.id, animationSteps);
    get().updateMyPlayerSectorId(params.sectorTo);

    set({ isPlayerMoving: false });

    resetNotificationsQuery();
  },

  animateToPrison: async (prisonId: number) => {
    const myPlayer = get().myPlayer;
    const myPlayerId = myPlayer?.id;
    if (!myPlayerId) throw new Error(`My player not found`);

    const playerModel = useModelsStore.getState().getPlayerModel(myPlayerId);
    const playerMesh = playerModel.children[0];

    const destinationSector = SectorsById[prisonId];
    const destinationPosition = calculatePlayerPositionOnSector(myPlayer, destinationSector);
    const distance = new Vector3(...destinationPosition).sub(playerModel.position).length();

    const destinationRotation = getSectorRotation(destinationSector.position);
    const playerGroupQuat = new Quaternion().setFromEuler(new Euler(...destinationRotation, 'XYZ'));
    const playerMeshQuat = new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0, 'XYZ'));
    const { moveToPlayer } = useCameraStore.getState();

    return new Promise(resolve => {
      createTimeline({
        onUpdate: () => moveToPlayer(playerModel, false),
      })
        .add(playerModel.position, {
          y: playerModel.position.y + 5,
          duration: 300,
        })
        .add(playerModel.position, {
          x: destinationPosition[0],
          z: destinationPosition[2],
          duration: distance * 20,
        })
        .add(playerModel.position, {
          y: playerModel.position.y,
          duration: 300,
          onUpdate: ({ progress }) => {
            playerModel.quaternion.rotateTowards(playerGroupQuat, progress);
            playerMesh.quaternion.rotateTowards(playerMeshQuat, progress);
          },
        })
        .then(() => resolve());
    });
  },

  moveMyPlayerToPrison: async () => {
    const { myPlayer } = get();
    if (!myPlayer) return;

    const prisonSector = getClosestPrison(myPlayer.sector_id);

    await get().animateToPrison(prisonSector);
    get().updateMyPlayerSectorId(prisonSector);
  },

  setTurnState: (turnState: PlayerTurnState | null) => set({ turnState }),

  removeCardFromState: (type: MainBonusCardType) => {
    set(state => ({
      myPlayer: state.myPlayer
        ? {
            ...state.myPlayer,
            bonus_cards: state.myPlayer.bonus_cards.filter(card => card.bonus_type !== type),
          }
        : null,
    }));
  },

  addCardToState: (card: ActiveBonusCard) => {
    set(state => ({
      myPlayer: state.myPlayer
        ? { ...state.myPlayer, bonus_cards: [...state.myPlayer.bonus_cards, card] }
        : null,
    }));
  },

  dropBonusCard: async (type: MainBonusCardType) => {
    const { setNextTurnState, removeCardFromState } = get();
    await dropBonusCard({ bonus_type: type });

    removeCardFromState(type);
    resetPlayersQuery();
    resetNotificationsQuery();
    await setNextTurnState({});
  },

  stealBonusCard: async (player: PlayerDetails, card: MainBonusCardType) => {
    const { setNextTurnState } = get();
    try {
      await stealBonusCardApi({ player_id: player.id, bonus_type: card });
    } catch (e) {
      refetechPlayersQuery();
      throw e;
    }
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
    return turnState === 'choosing-building-sector' && myPlayer?.sector_id === 1;
  },
  setPrisonCards: (cards: MainBonusCardType[]) => set({ prisonCards: cards }),
}));

export default usePlayerStore;
