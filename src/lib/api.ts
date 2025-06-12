import {
  BackendPlayerData,
  BonusCardType,
  GameLengthWithDrop,
  GameStatusType,
  PlayerEvent,
  PlayerTurnState,
  RulesVersion,
} from "@/lib/types";
import { playersData } from "./mockData";
import { IS_DEV } from "./constants";

const MOCK_API = false;
const API_HOST = IS_DEV ? "http://localhost:8000" : "https://igropolius.ru";

async function apiRequest(endpoint: string, params: RequestInit = {}): Promise<Response> {
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
    console.error("API request failed:", {
      endpoint,
      status: response.status,
      error: errorData,
    });
    return Promise.reject({ body: errorData, status: response.status });
  }
  return response;
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
          subtype: "completed",
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
          subtype: "dice-roll",
          sector_id: 10,
          sector_to: 15,
          completed_map: false,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 29 2025 07:07").getTime(),
          subtype: "street-tax",
          sector_id: 15,
          amount: -20,
          tax_player_id: 2,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 29 2025 02:54").getTime(),
          subtype: "map-tax",
          sector_id: 15,
          amount: 100,
        },
        {
          event_type: "score-change",
          timestamp: new Date("04 28 2025 11:23").getTime(),
          subtype: "street-tax",
          sector_id: 7,
          amount: 50,
          tax_player_id: 3,
        },
      ],
    });
  }
  const response = await apiRequest(`/api/players/${playerId}/events`);
  return response.json();
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
  const response = await apiRequest("/api/players/current");
  return response.json();
}

type PlayersResponse = {
  players: BackendPlayerData[];
};

export async function fetchPlayers(): Promise<PlayersResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      players: playersData,
    });
  }
  const response = await apiRequest("/api/players");
  return response.json();
}

type RulesResponse = {
  versions: RulesVersion[];
};

export async function fetchCurrentRules(): Promise<RulesResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      versions: [
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
      ],
    });
  }
  const response = await apiRequest("/api/rules/current");
  return response.json();
}

export async function fetchAllRules(): Promise<RulesResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      versions: [
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
  const response = await apiRequest("/api/rules");
  return response.json();
}

export async function saveRulesVersion(content: string): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  const response = await apiRequest("/api/rules", {
    method: "POST",
    body: JSON.stringify({ content, created_at: 0 }),
  });
  if (!response.ok) {
    return Promise.reject("Failed to save rules version");
  }
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
  const response = await apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function logout(): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  const response = await apiRequest("/api/logout", { method: "POST" });
  if (!response.ok) {
    return Promise.reject("Logout failed");
  }
}

type PlayerMoveRequest = {
  type: "dice-roll" | "train-ride";
  dice_roll_id: number;
  bonuses_used: string[];
  selected_die: number | null;
  tmp_roll_result: number;
};

export async function makePlayerMove(request: PlayerMoveRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest("/api/players/current/moves", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function saveTurnState(state: PlayerTurnState): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest("/api/players/current/turn-state", {
    method: "POST",
    body: JSON.stringify({ turn_state: state }),
  });
}

type GameReviewRequest = {
  status: GameStatusType;
  title: string;
  review: string;
  rating: number;
  length: GameLengthWithDrop;
  scores: number;
};

export async function saveGameReview(request: GameReviewRequest): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest("/api/player-games", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function giveBonusCard(bonusType: BonusCardType): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/players/current/bonus-cards`, {
    method: "POST",
    body: JSON.stringify({ bonus_type: bonusType }),
  });
}
