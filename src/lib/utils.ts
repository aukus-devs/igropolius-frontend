import {
  ActiveBonusCard,
  PlayerEvent,
  PlayerEventBonusCard,
  PlayerEventGame,
  PlayerEventMove,
  PlayerEventScoreChange,
  PlayerTurnState,
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

export function getNextTurnState(
  mapPosition: number,
  currentState: PlayerTurnState,
  bonusCards: ActiveBonusCard[],
): PlayerTurnState {
  const sector = SectorsById[mapPosition];

  const streetTaxCards = bonusCards.filter((card) => card.bonus_type === "evade-street-tax");
  const prisonCards = bonusCards.filter((card) => card.bonus_type === "skip-prison-day");
  const rerollCards = bonusCards.filter((card) => card.bonus_type === "reroll-game");
  const diceCards = bonusCards.filter((card) => card.bonus_type === "adjust-roll-by1");

  switch (currentState) {
    case "rolling-dice":
      if (diceCards.length > 0) {
        return "using-dice-bonuses";
      }
      if (streetTaxCards.length > 0) {
        return "using-sector-bonuses";
      }
      if (rerollCards.length > 0) {
        return "using-reroll-bonuses";
      }
      return "filling-game-review";
    case "using-dice-bonuses":
      if (sector.type === "bonus") {
        return "rolling-bonus-card";
      }
      if (sector.type === "prison" && prisonCards.length > 0) {
        return "using-sector-bonuses";
      }
      if (
        (sector.type === "property" || sector.type === "railroad") &&
        streetTaxCards.length > 0
      ) {
        return "using-sector-bonuses";
      }
      if (rerollCards.length > 0) {
        return "using-reroll-bonuses";
      }
      return "filling-game-review";
    case "rolling-bonus-card":
      return "rolling-dice";
    case "using-sector-bonuses":
      return "filling-game-review";
    case "using-reroll-bonuses":
      return "filling-game-review";
    case "filling-game-review":
      if (sector.type === "railroad") {
        return "choosing-train-ride";
      }
      if (sector.type === "bonus") {
        return "rolling-bonus-card";
      }
      return "rolling-dice";
    case "choosing-train-ride":
      return "rolling-dice";
  }
  return null as never;
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
