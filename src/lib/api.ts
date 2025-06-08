import { PlayerData, PlayerEvent, PlayerTurnState, RulesVersion } from "@/lib/types";
import { playersData } from "./mockData";
import { IS_DEV } from "./constants";

const MOCK_API = IS_DEV;

const API_HOST = IS_DEV ? "http://localhost:8000" : "https://igropolius-backend.onrender.com";

async function apiRequest<T>(endpoint: string, params: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("access-token") ?? "";
  const response = await fetch(`${API_HOST}${endpoint}`, {
    ...params,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    return Promise.reject({ body: errorData, status: response.status });
  }
  return response.json() as Promise<T>;
}

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
  return apiRequest(`/api/players/${playerId}/events`);
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
  return apiRequest("/api/players/current");
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
  return apiRequest("/api/players");
}

type RulesResponse = {
  rules: RulesVersion[];
};

export async function fetchRules(): Promise<RulesResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      rules: [
        {
          content: JSON.stringify({
            ops: [
              { insert: "Третья версия правил" },
              { insert: "\n" },
              { insert: "Читы и подсказки запрещены" },
            ],
          }),
          created_at: Math.ceil(new Date("2025-04-30").getTime() / 1000),
        },
        {
          content: JSON.stringify({
            ops: [
              { insert: "Вторая версия правил" },
              { insert: "\n" },
              { insert: "Читы запрещены" },
            ],
          }),
          created_at: Math.ceil(new Date("2025-04-29").getTime() / 1000),
        },
        {
          content: JSON.stringify({ ops: [{ insert: "Первая версия правил" }] }),
          created_at: Math.ceil(new Date("2025-04-28").getTime() / 1000),
        },
      ],
    });
  }
  return apiRequest("/api/rules");
}

type LoginResponse = {
  token: string;
};

export async function login(username: string, password: string): Promise<LoginResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      token: "mock-token",
    });
  }
  return apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
