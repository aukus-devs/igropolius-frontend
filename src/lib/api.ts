import { PlayerData, PlayerEvent } from "@/lib/types";
import { playersData } from "./mockData";

const IS_DEV = import.meta.env.MODE === "development";
const MOCK_API = IS_DEV || true;

type PlayerEventsResponse = {
  events: PlayerEvent[];
};

export async function fetchPlayerEvents(playerId: number): Promise<PlayerEventsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      events: [
        {
          event_type: "game",
          timestamp: Math.ceil(Date.now() / 1000) - 60,
          type: "completed",
          game_title: "Witcher 5",
          game_review: "good",
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
        },
        {
          event_type: "player-move",
          timestamp: Math.ceil(Date.now() / 1000) - 30,
          adjusted_roll: 5,
          type: "dice-roll",
          sector_id: 10,
          sector_to: 15,
          completed_map: false,
        },
        {
          event_type: "score-change",
          timestamp: Math.ceil(Date.now() / 1000) - 10,
          type: "street-tax",
          sector_id: 15,
          amount: -20,
          tax_player_id: 2,
        },
      ],
    });
  }
  return fetch(`/api/players/${playerId}/events`).then((res) => res.json());
}

type CurrentPlayerResponse = {
  id: number;
  nickname: string;
  url_handle: string;
};

export async function fetchCurrentPlayer(): Promise<CurrentPlayerResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      id: 1,
      nickname: "Praden",
      url_handle: "praden",
    });
  }
  return fetch("/api/players/current").then((res) => res.json());
}

type PlayersResponse = {
  players: PlayerData[];
};

export async function fetchPlayers(): Promise<PlayersResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      players: playersData,
    });
  }
  return fetch("/api/players").then((res) => res.json());
}
