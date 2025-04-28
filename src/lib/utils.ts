import { PlayerEvent } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getEventDescription(event: PlayerEvent): string {
  if (event.event_type === "game") {
    if (event.type === "completed") {
      return `Прошел ${event.game_title}`;
    }
    if (event.type === "drop") {
      return `Дропнул ${event.game_title}`;
    }
    if (event.type === "reroll") {
      return `Рерольнул ${event.game_title}`;
    }
  }
  if (event.event_type === "bonus-card") {
    if (event.type === "received") {
      return `Получил бонуску ${event.bonus_type}`;
    }
    if (event.type === "used") {
      return `Использовал бонуску ${event.bonus_type}`;
    }
    if (event.type === "lost") {
      return `Потерял бонуску ${event.bonus_type}`;
    }
  }
  if (event.event_type === "player-move") {
    if (event.type === "train-ride") {
      return `Проехал на поезде с ${event.sector_id} до ${event.sector_to}`;
    }
    if (event.type === "dice-roll") {
      return `Бросил кубик на ${event.adjusted_roll} и попал на сектор ${event.sector_to}`;
    }
  }
  if (event.event_type === "score-change") {
    if (event.type === "map-tax") {
      return `Заплатил налог за круг: ${event.amount}`;
    }
    if (event.type === "street-tax") {
      return `Заплатил налог за сектор: ${event.amount}`;
    }
    if (event.type === "game-completed") {
      return `Получил очков за игру: ${event.amount}`;
    }
  }
  return `unsupported event type: ${event.event_type}` as never;
}
