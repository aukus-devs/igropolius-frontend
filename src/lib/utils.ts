import {
  BonusCardType,
  EventDescription,
  PlayerData,
  PlayerEvent,
  PlayerEventBonusCard,
  PlayerEventGame,
  PlayerEventMove,
  PlayerEventScoreChange,
  PlayerStateAction,
  PlayerTurnState,
  SectorData,
} from '@/lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SectorsById } from './mockData';
import { FALLBACK_GAME_POSTER } from './constants';

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

function getEventGameInfo(event: PlayerEventGame) {
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

function getEventMoveInfo(event: PlayerEventMove) {
  let title = '';

  switch (event.subtype) {
    case 'train-ride':
      title = 'Проехал на поезде';
      break;
    case 'dice-roll':
      title = 'Ход на карте';
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

function getEventScoreChangeInfo(event: PlayerEventScoreChange) {
  let title = '';

  switch (event.subtype) {
    case 'street-tax':
      title = `${event.amount > 0 ? 'Получил' : 'Заплатил'} налог на клетке ${event.sector_id}`;
      break;
    case 'map-tax':
      title = 'Получил налог за круг';
      break;
    case 'game-completed':
      title = 'Получил очки за игру';
      break;
    case 'game-dropped':
      title = 'Потерял очки за дроп игры';
      break;
    default: {
      const subtype: never = event.subtype;
      throw new Error(`Unsupported score change event subtype: ${subtype}`);
    }
  }

  return {
    title,
    description: event.amount.toString(),
  };
}

function getEventBonusCardInfo(event: PlayerEventBonusCard) {
  let title = '';

  switch (event.subtype) {
    case 'received':
      title = 'Получил карточку';
      break;
    case 'used':
      title = 'Использовал карточку';
      break;
    case 'lost':
      title = 'Потерял карточку';
      break;
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

export function getBonusCardName(bonusType: BonusCardType): string {
  switch (bonusType) {
    case 'adjust-roll-by1':
      return 'Изменить бросок на ±1';
    case 'choose-1-die':
      return 'Выбрать 1 кубик';
    case 'skip-prison-day':
      return 'Пропустить день в тюрьме';
    case 'reroll-game':
      return 'Реролл игры';
    case 'evade-street-tax':
      return 'Уклониться от налога на клетке';
    case 'evade-map-tax':
      return 'Уклониться от налога за круг';
    case 'game-help-allowed':
      return 'Помощь в игре разрешена';
    default: {
      const error: never = bonusType;
      throw new Error(`Unsupported bonus card type: ${error}`);
    }
  }
}

export function getEventDescription(event: PlayerEvent): EventDescription {
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

  const hasStreetTaxCard = bonusCardsSet.has('evade-street-tax');
  const hasMapTaxCard = bonusCardsSet.has('evade-map-tax');
  const hasPrisonCard = bonusCardsSet.has('skip-prison-day');
  const hasRerollCard = bonusCardsSet.has('reroll-game');
  const hasDiceCards = bonusCardsSet.has('adjust-roll-by1') || bonusCardsSet.has('choose-1-die');

  console.log('current cards', bonusCardsSet);

  const statesToStop: PlayerTurnState[] = [
    'rolling-dice',
    'rolling-bonus-card',
    'filling-game-review',
    // temporaly disable until implemented
    // 'entering-prison',
    'choosing-train-ride',
    'choosing-building-sector',
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
      hasStreetTaxCard,
      hasMapTaxCard,
      hasPrisonCard,
      hasRerollCard,
      hasDiceCards,
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
  hasStreetTaxCard: boolean;
  hasMapTaxCard: boolean;
  hasPrisonCard: boolean;
  hasRerollCard: boolean;
  hasDiceCards: boolean;
};

type StateCycle = 'stop' | PlayerTurnState;

function getNextState({
  currentState,
  action,
  sector,
  mapCompleted,
  hasStreetTaxCard,
  hasMapTaxCard,
  hasPrisonCard,
  hasRerollCard,
  hasDiceCards,
}: GetNextStateParams): StateCycle {
  const skipBonus = action === 'skip-bonus';

  switch (currentState) {
    case 'rolling-dice':
      return 'using-dice-bonuses';
    case 'using-dice-bonuses':
      if (hasDiceCards && !skipBonus) {
        return 'stop';
      }
      return 'using-map-tax-bonuses';
    case 'using-map-tax-bonuses':
      if (mapCompleted && hasMapTaxCard && !skipBonus) {
        return 'stop';
      }
      return 'using-street-tax-bonuses';
    case 'using-street-tax-bonuses':
      if (
        (sector.type === 'property' || sector.type === 'railroad') &&
        hasStreetTaxCard &&
        !skipBonus
      ) {
        return 'stop';
      }
      return 'using-prison-bonuses';
    case 'using-prison-bonuses':
      if (sector.type === 'prison' && hasPrisonCard && !skipBonus) {
        if (action === 'skip-prison') {
          return 'rolling-dice';
        }
        return 'stop';
      }
      return 'using-reroll-bonuses';
    case 'using-reroll-bonuses':
      if (hasRerollCard && !skipBonus) {
        return 'stop';
      }
      return 'filling-game-review';
    case 'filling-game-review':
      if (action === 'drop-game') {
        return 'entering-prison';
      }
      if (action === 'reroll-game') {
        return 'using-reroll-bonuses';
      }
      switch (sector.type) {
        case 'railroad':
          return 'choosing-train-ride';
        case 'bonus':
          return 'rolling-bonus-card';
        case 'property':
          return 'rolling-dice';
        case 'prison':
          return 'entering-prison';
        case 'parking':
          return 'stealing-bonus-card';
        case 'start-corner':
          return 'choosing-building-sector';
        default: {
          const sectorType: never = sector.type;
          throw new Error(`Unsupported sector type: ${sectorType}`);
        }
      }
    case 'rolling-bonus-card':
      return 'rolling-dice';
    case 'choosing-train-ride':
      if (mapCompleted && hasMapTaxCard) {
        return 'using-map-tax-bonuses-after-train-ride';
      }
      return 'rolling-dice';
    case 'entering-prison':
      return 'using-prison-bonuses';
    case 'stealing-bonus-card':
      return 'rolling-dice';
    case 'choosing-building-sector':
      return 'rolling-dice';
    case 'using-map-tax-bonuses-after-train-ride':
      return 'rolling-dice';
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
