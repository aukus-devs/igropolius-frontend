import {
  PlayerData,
  PlayerEvent,
  PlayerEventBonusCard,
  PlayerEventGame,
  PlayerEventMove,
  PlayerEventScoreChange,
  PlayerStateAction,
  PlayerTurnState,
  SectorData,
} from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SectorsById } from "./mockData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getShortestRotationDelta(current: number, target: number) {
  const delta = target - current;
  // Normalize to [-π, π] range to get shortest path
  return ((delta + Math.PI) % (2 * Math.PI)) - Math.PI;
}

function getEventGameInfo(event: PlayerEventGame) {
  let title = "";

  switch (event.subtype) {
    case "completed":
      title = "Прошел игру";
      break;
    case "drop":
      title = "Дроп игры";
      break;
    case "reroll":
      title = "Реролл игры";
      break;
  }

  return {
    title,
    description: event.game_title,
  };
}

function getEventMoveInfo(event: PlayerEventMove) {
  let title = "";

  switch (event.subtype) {
    case "train-ride":
      title = "Проехал на поезде";
      break;
    case "dice-roll":
      title = "Ход на карте";
      break;
  }

  return {
    title,
    description: `С ${event.sector_id} клетки на ${event.sector_to}`,
  };
}

function getEventScoreChangeInfo(event: PlayerEventScoreChange) {
  let title = "";

  switch (event.subtype) {
    case "street-tax":
      title = `${event.amount > 0 ? "Получил" : "Заплатил"} налог на клетке ${event.sector_id}`;
      break;
    case "map-tax":
      title = "Получил налог за круг";
      break;
    case "game-completed":
      title = "Получил очки за игру";
      break;
    case "game-dropped":
      title = "Потерял очки за дроп игры";
      break;
  }

  return {
    title,
    description: event.amount.toString(),
  };
}

function getEventBonusCardInfo(event: PlayerEventBonusCard) {
  let title = "";

  switch (event.subtype) {
    case "received":
      title = "Получил карточку";
      break;
    case "used":
      title = "Использовал карточку";
      break;
    case "lost":
      title = "Потерял карточку";
      break;
  }

  return {
    title,
    description: event.bonus_type,
  };
}

export function getEventDescription(event: PlayerEvent) {
  if (event.event_type === "game") {
    return getEventGameInfo(event);
  }

  if (event.event_type === "bonus-card") {
    return getEventBonusCardInfo(event);
  }

  if (event.event_type === "player-move") {
    return getEventMoveInfo(event);
  }

  if (event.event_type === "score-change") {
    return getEventScoreChangeInfo(event);
  }

  throw new Error(`Unsupported event type`);
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
  const bonusCardsSet = new Set(player.bonus_cards.map((card) => card.bonus_type));

  const hasStreetTaxCard = bonusCardsSet.has("evade-street-tax");
  const hasMapTaxCard = bonusCardsSet.has("evade-map-tax");
  const hasPrisonCard = bonusCardsSet.has("skip-prison-day");
  const hasRerollCard = bonusCardsSet.has("reroll-game");
  const hasDiceCards =
    bonusCardsSet.has("adjust-roll-by1") || bonusCardsSet.has("choose-1-die");

  let maxLoops = 10;
  let state = currentState;
  console.log("current state:", currentState);
  while (maxLoops--) {
    const iteration = getNextState({
      currentState: state,
      sector,
      mapCompleted,
      hasStreetTaxCard,
      hasMapTaxCard,
      hasPrisonCard,
      hasRerollCard,
      hasDiceCards,
      action,
    });
    console.log("next state:", iteration.nextState);

    if (iteration.stop) {
      return iteration.nextState; // Stop condition met, return next state
    }
    state = iteration.nextState; // Update state for next iteration
  }
  throw new Error("Infinite loop detected in getNextTurnState");
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

type StateCycle = {
  stop: boolean;
  nextState: PlayerTurnState;
};

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
  const skip = action === "skip-bonus";

  switch (currentState) {
    case "rolling-dice":
      return { stop: false, nextState: "using-dice-bonuses" };
    case "using-dice-bonuses":
      if (hasDiceCards && !skip) {
        return { stop: true, nextState: "using-dice-bonuses" };
      }
      return { stop: false, nextState: "using-map-tax-bonuses" };
    case "using-map-tax-bonuses":
      if (mapCompleted && hasMapTaxCard && !skip) {
        return { stop: true, nextState: "using-map-tax-bonuses" };
      }
      return { stop: false, nextState: "using-street-tax-bonuses" };
    case "using-street-tax-bonuses":
      if (
        (sector.type === "property" || sector.type === "railroad") &&
        hasStreetTaxCard &&
        !skip
      ) {
        return { stop: true, nextState: "using-street-tax-bonuses" };
      }
      return { stop: false, nextState: "using-prison-bonuses" };
    case "using-prison-bonuses":
      if (sector.type === "prison" && hasPrisonCard && !skip) {
        if (action === "skip-prison") {
          return { stop: true, nextState: "filling-game-review" };
        }
        return { stop: true, nextState: "using-prison-bonuses" };
      }
      return { stop: false, nextState: "using-reroll-bonuses" };
    case "using-reroll-bonuses":
      if (hasRerollCard && !skip) {
        return { stop: true, nextState: "using-reroll-bonuses" };
      }
      return { stop: false, nextState: "filling-game-review" };
    case "filling-game-review":
      if (action === "drop-game") {
        return { stop: false, nextState: "using-prison-bonuses" };
      }
      if (action === "reroll-game") {
        return { stop: false, nextState: "using-reroll-bonuses" };
      }
      switch (sector.type) {
        case "railroad":
          return { stop: true, nextState: "choosing-train-ride" };
        case "bonus":
          return { stop: true, nextState: "rolling-bonus-card" };
        case "property":
          return { stop: true, nextState: "rolling-dice" };
        case "prison":
          return { stop: true, nextState: "entering-prison" };
        case "parking":
          return { stop: true, nextState: "stealing-bonus-card" };
        case "start-corner":
          return { stop: true, nextState: "choosing-building-sector" };
        default: {
          const sectorType: never = sector.type;
          throw new Error(`Unsupported sector type: ${sectorType}`);
        }
      }
    case "rolling-bonus-card":
      return { stop: true, nextState: "rolling-dice" };
    case "choosing-train-ride":
      return { stop: true, nextState: "rolling-dice" };
    case "entering-prison":
      return { stop: false, nextState: "using-prison-bonuses" };
    case "stealing-bonus-card":
      return { stop: true, nextState: "rolling-dice" };
    case "choosing-building-sector":
      return { stop: true, nextState: "rolling-dice" };
    default: {
      const state: never = currentState;
      throw new Error(`Unsupported turn state: ${state}`);
    }
  }
}

export function formatTsToFullDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTsToMonthDatetime(ts: number) {
  return new Date(ts * 1000).toLocaleString("ru-RU", {
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMs(diffMs: number) {
  const diffS = Math.floor(diffMs / 1000);
  const days = Math.floor(diffS / (60 * 60 * 24));
  const hours = Math.floor((diffS % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((diffS % (60 * 60)) / 60);
  const seconds = diffS % 60;

  const hoursPadded = String(hours).padStart(2, "0");
  const minutesPadded = String(minutes).padStart(2, "0");
  const secondsPadded = String(seconds).padStart(2, "0");

  if (hours === 0) {
    return `${minutesPadded}м ${secondsPadded}с`;
  }

  if (days === 0) {
    return `${hoursPadded}ч ${minutesPadded}м`;
  }

  return `${days}д ${hoursPadded}ч`;
}
