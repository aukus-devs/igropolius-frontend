import {
  EventDescription,
  GameLength,
  GameStatusType,
  PlayerData,
  PlayerStateAction,
  SectorData,
} from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { frontendCardsData, SectorsById } from './mockData';
import { FALLBACK_GAME_POSTER, ScoreByGameLength, SectorScoreMultiplier } from './constants';
import usePlayerStore from '@/stores/playerStore';
import {
  BonusCardEvent,
  BonusCardType,
  Events,
  GameEvent,
  MainBonusCardType,
  MoveEvent,
  PlayerTurnState,
  ScoreChangeEvent,
} from './api-types-generated';
import { canBuildOnSector } from '@/components/map/utils';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getShortestRotationDelta(current: number, target: number) {
  const delta = target - current;
  // Normalize to [-π, π] range to get shortest path
  return ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
}

function getEventGameInfo(event: GameEvent) {
  let title = '';

  switch (event.subtype) {
    case 'completed':
      title = 'Прошел игру';
      break;
    case 'drop':
      title = 'Дроп игры';
      break;
    case 'reroll':
      title = 'Реролл игры';
      break;
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported game event subtype: ${subtype}`);
    }
  }
  return {
    title,
    description: event.game_title,
    gameCover: event.game_cover || FALLBACK_GAME_POSTER,
  };
}

function getEventMoveInfo(event: MoveEvent) {
  let title = '';

  switch (event.subtype) {
    case 'train-ride':
      title = 'Проехал на поезде';
      break;
    case 'dice-roll':
      title = 'Ход на карте';
      break;
    case 'drop-to-prison':
      title = 'Попал в тюрьму';
      break;
    default: {
      const error: never = event.subtype;
      throw new Error(`Unsupported move event subtype: ${error}`);
    }
  }

  return {
    title,
    description: `С ${event.sector_from} клетки на ${event.sector_to}`,
  };
}

function getEventScoreChangeInfo(event: ScoreChangeEvent) {
  let title = '';

  switch (event.subtype) {
    case 'street-tax':
      title = `Заплатил налог на клетке ${event.sector_id}`;
      break;
    case 'map-tax':
      title = 'Заплатил налог за круг';
      break;
    case 'game-completed':
      title = 'Получил очки за игру';
      break;
    case 'game-dropped':
      title = 'Потерял очки за дроп игры';
      break;
    case 'street-income': {
      const incomePlayer = usePlayerStore
        .getState()
        .players.find(p => p.id === event.income_from_player);
      title = `Получил доход с сектора ${event.sector_id} от ${incomePlayer?.username}`;
      break;
    }
    case 'instant-card':
      title = `Получено от инстантной карточки`;
      break;
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported score change event subtype: ${subtype}`);
    }
  }

  return {
    title,
    description: '',
  };
}

function getEventBonusCardInfo(event: BonusCardEvent) {
  let title = '';
  const players = usePlayerStore.getState().players;

  switch (event.subtype) {
    case 'received':
      title = 'Получил карточку';
      break;
    case 'used':
      title = 'Использовал карточку';
      break;
    case 'dropped':
      title = 'Потерял карточку';
      break;
    case 'stolen-from-me': {
      const player = players.find(p => p.id === event.stolen_by);
      title = `${player?.username} украл карточку`;
      break;
    }
    case 'stolen-by-me': {
      const player = players.find(p => p.id === event.stolen_from_player);
      title = `Карточка украдена у ${player?.username}`;
      break;
    }
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported bonus card event subtype: ${subtype}`);
    }
  }

  return {
    title,
    description: event.bonus_type,
  };
}

export function getBonusCardName(bonusType: MainBonusCardType): string {
  const data = frontendCardsData[bonusType];
  return data.name;
}

export function getEventDescription(event: Events[0]): EventDescription {
  const eventType = event.event_type;
  switch (eventType) {
    case 'game':
      return getEventGameInfo(event);
    case 'bonus-card':
      return getEventBonusCardInfo(event);
    case 'player-move':
      return getEventMoveInfo(event);
    case 'score-change':
      return getEventScoreChangeInfo(event);
    default: {
      const error: never = eventType;
      throw new Error(`Unsupported event type: ${error}`);
    }
  }
}

type NextTurnStateParams = {
  player: PlayerData;
  currentState: PlayerTurnState;
  mapCompleted: boolean;
  action?: PlayerStateAction;
};

export function getNextTurnState({
  player,
  currentState,
  mapCompleted,
  action,
}: NextTurnStateParams): PlayerTurnState {
  const sector = SectorsById[player.sector_id];
  const bonusCardsSet = new Set(player.bonus_cards.map(card => card.bonus_type));

  console.log('current cards', bonusCardsSet);

  const statesToStop: PlayerTurnState[] = [
    'rolling-dice',
    'using-dice-bonuses',
    'rolling-bonus-card',
    'filling-game-review',
    'entering-prison',
    'dropping-card-after-game-drop',
    'dropping-card-after-instant-roll',
    'stealing-bonus-card',
  ];

  let maxIterations = 10;
  let state = currentState;
  let currentAction = action;
  console.log('current state:', currentState, action);
  while (maxIterations--) {
    const iteration = getNextState({
      currentState: state,
      sector,
      mapCompleted,
      bonusCardsSet,
      action: currentAction,
    });
    currentAction = undefined; // Reset action after first iteration
    console.log('next state:', iteration, currentAction);
    if (iteration === 'stop') {
      return state; // No further state change, return current state
    }
    if (statesToStop.includes(iteration)) {
      return iteration;
    }
    state = iteration; // Update state for next iteration
  }
  throw new Error('Infinite loop detected in getNextTurnState');
}

type GetNextStateParams = {
  currentState: PlayerTurnState;
  action?: PlayerStateAction;
  sector: SectorData;
  mapCompleted?: boolean;
  bonusCardsSet: Set<BonusCardType>;
};

type StateCycle = 'stop' | PlayerTurnState;

function getNextState({
  currentState,
  action,
  sector,
  mapCompleted,
  bonusCardsSet,
}: GetNextStateParams): StateCycle {
  const hasStreetTaxCard = bonusCardsSet.has('evade-street-tax');
  const hasMapTaxCard = bonusCardsSet.has('evade-map-tax');
  const hasPrisonCard = bonusCardsSet.has('skip-prison-day');
  const hasDiceCards = bonusCardsSet.has('adjust-roll-by1') || bonusCardsSet.has('choose-1-die');

  const skipBonus = action === 'skip-bonus';

  switch (currentState) {
    case 'rolling-dice':
      return 'using-dice-bonuses';
    case 'using-dice-bonuses':
      if (hasDiceCards && !skipBonus) {
        return 'stop';
      }
      if (sector.type === 'railroad' && !skipBonus) {
        return 'stop';
      }
      return 'using-map-tax-bonuses';
    case 'using-map-tax-bonuses':
      if (mapCompleted && hasMapTaxCard && !skipBonus) {
        return 'stop';
      }
      return 'using-street-tax-bonuses';
    case 'using-street-tax-bonuses':
      if (canBuildOnSector(sector.type) && hasStreetTaxCard && !skipBonus) {
        return 'stop';
      }
      if (sector.type === 'prison') {
        return 'entering-prison';
      }
      return 'filling-game-review';
    case 'using-prison-bonuses':
      if (sector.type === 'prison' && hasPrisonCard && !skipBonus) {
        if (action === 'skip-prison') {
          return 'rolling-dice';
        }
        return 'stop';
      }
      return 'filling-game-review';
    case 'filling-game-review':
      if (action === 'drop-game') {
        return 'dropping-card-after-game-drop';
      }
      if (action === 'reroll-game') {
        return 'filling-game-review';
      }
      if (action === 'drop-card') {
        return 'dropping-card-after-instant-roll';
      }
      switch (sector.type) {
        case 'bonus':
          return 'rolling-bonus-card';
        case 'parking':
          return 'stealing-bonus-card';
        case 'railroad':
          return 'rolling-dice';
        case 'property':
          return 'rolling-dice';
        case 'prison':
          return 'rolling-dice';
        case 'start-corner':
          return 'rolling-dice';
        default: {
          const sectorType: never = sector.type;
          throw new Error(`Unsupported sector type: ${sectorType}`);
        }
      }
    case 'rolling-bonus-card':
      return 'rolling-dice';
    case 'dropping-card-after-game-drop':
      return 'entering-prison';
    case 'entering-prison':
      return 'using-prison-bonuses';
    case 'stealing-bonus-card':
      return 'rolling-dice';
    case 'dropping-card-after-instant-roll':
      return 'filling-game-review';
    default: {
      const state: never = currentState;
      throw new Error(`Unsupported turn state: ${state}`);
    }
  }
}

export function formatTsToFullDate(ts: number) {
  return new Date(ts * 1000).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTsToMonthDatetime(ts: number) {
  return new Date(ts * 1000).toLocaleString('ru-RU', {
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatMs(diffMs: number) {
  const diffS = Math.floor(diffMs / 1000);
  const days = Math.floor(diffS / (60 * 60 * 24));
  const hours = Math.floor((diffS % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffS % (60 * 60)) / 60);
  const seconds = diffS % 60;

  const hoursPadded = String(hours).padStart(2, '0');
  const minutesPadded = String(minutes).padStart(2, '0');
  const secondsPadded = String(seconds).padStart(2, '0');

  if (days > 0) {
    if (hours === 0) {
      return `${days}д ${minutesPadded}м`;
    }
    return `${days}д ${hoursPadded}ч`;
  }

  if (hours === 0) {
    return `${minutesPadded}м ${secondsPadded}с`;
  }

  return `${hoursPadded}ч ${minutesPadded}м`;
}

type CompletionScoreParams = {
  gameStatus: GameStatusType;
  gameLength: GameLength | null;
  mapsCompleted: number;
  sectorId: number;
};

export function calculateGameCompletionScore({
  gameStatus,
  gameLength,
  mapsCompleted,
  sectorId,
}: CompletionScoreParams) {
  const mapCompletionBonus = mapsCompleted * 5;

  const sector = SectorsById[sectorId];
  const sectorMultiplier = SectorScoreMultiplier[sector.type] || 1;

  if (gameStatus === 'completed' && gameLength) {
    const base = ScoreByGameLength[gameLength];
    const total = base * sectorMultiplier + mapCompletionBonus;
    return {
      base,
      sectorMultiplier,
      total,
      mapCompletionBonus,
    };
  }
  if (gameStatus === 'drop') {
    return {
      base: 0,
      total: 0,
      sectorMultiplier,
      mapCompletionBonus,
    };
  }
  return {
    base: 0,
    sectorMultiplier: 0,
    total: 0,
    mapCompletionBonus,
  };
}
