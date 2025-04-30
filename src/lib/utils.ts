import { PlayerEvent, PlayerEventBonusCard, PlayerEventGame, PlayerEventMove, PlayerEventScoreChange } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getEventGameInfo(event: PlayerEventGame) {
  let title = "";

  switch (event.type) {
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
  }
}

function getEventMoveInfo(event: PlayerEventMove) {
  let title = "";

  switch (event.type) {
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

  switch (event.type) {
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

  switch (event.type) {
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
