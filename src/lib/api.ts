import { PlayerData, PlayerEvent, PlayerTurnState } from "@/lib/types";
import { playersData } from "./mockData";
import { IS_DEV } from "./constants";

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
          timestamp: new Date("04 30 2025 18:22").getTime(),
          type: "completed",
          game_title: "Witcher 5",
          game_review: "good",
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
        },
        {
          event_type: "player-move",
          timestamp: new Date("04 30 2025 17:40").getTime(),
          adjusted_roll: 5,
          type: "dice-roll",
          sector_id: 10,
          sector_to: 15,
          completed_map: false,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 29 2025 07:07").getTime(),
          type: "street-tax",
          sector_id: 15,
          amount: -20,
          tax_player_id: 2,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 29 2025 02:54").getTime(),
          type: "map-tax",
          sector_id: 15,
          amount: 100,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 28 2025 11:23").getTime(),
          type: "street-tax",
          sector_id: 7,
          amount: 50,
          tax_player_id: 3,
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
  turn_state: PlayerTurnState;
};

export async function fetchCurrentPlayer(): Promise<CurrentPlayerResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      id: 1,
      nickname: "Praden",
      url_handle: "praden",
      turn_state: "rolling-dice",
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
