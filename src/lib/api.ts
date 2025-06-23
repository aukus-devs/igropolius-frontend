import {
  BackendPlayerData,
  BonusCardType,
  GameLengthWithDrop,
  GameStatusType,
  PlayerEvent,
  PlayerTurnState,
  RulesVersion,
  TaxType,
} from "@/lib/types";
import { playersData } from "./mockData";
import { IS_DEV, NO_MOCKS } from "./constants";

const MOCK_API = NO_MOCKS ? false : IS_DEV;

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
          timestamp: 1750661642,
          subtype: "completed",
          game_title: "Witcher 5",
          game_cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
          game_review: "good",
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
          bonuses_used: ["reroll-game", "game-help-allowed"],
        },
        {
          event_type: "game",
          timestamp: Math.floor(new Date("04 30 2025 18:20").getTime() / 1000),
          subtype: "completed",
          game_title: "Witcher 5",
          game_cover: null,
          game_review: "good",
          game_score: 9.5,
          sector_id: 10,
          duration: 200,
          bonuses_used: ["reroll-game", "game-help-allowed"],
        },
        {
          event_type: "game",
          timestamp: Math.floor(new Date("04 30 2025 18:19").getTime() / 1000),
          subtype: "completed",
          game_title: "Witcher 5",
          game_cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
          game_review: "good",
          game_score: 9.5,
          sector_id: 10,
          duration: 200
        },
        {
          event_type: "player-move",
          timestamp: Math.floor(new Date("04 30 2025 17:40").getTime() / 1000),
          adjusted_roll: 5,
          subtype: "dice-roll",
          sector_from: 10,
          sector_to: 15,
          completed_map: false,
          bonuses_used: ["adjust-roll-by1", "choose-1-die"],
          dice_roll_json: {
            is_random_org_result: true,
            random_org_check_form: "https://api.random.org/signatures/form?format=json&random=eyJtZXRob2QiOiJnZW5lcmF0ZVNpZ25lZEludGVnZXJzIiwiaGFzaGVkQXBpS2V5Ijoib2Y0T1c3MXQ3alFnNXZJb0pFdFBPUmVPNTA4UFNzZnpNL0x2ZlZwTmFIUDFCNjJ4NzgyWFBxR3ZLV0ZiTXhwYlRqcUNHbENEUS9oVldzRmFFT3Y3RFE9PSIsIm4iOjIsIm1pbiI6MSwibWF4Ijo4LCJyZXBsYWNlbWVudCI6dHJ1ZSwiYmFzZSI6MTAsInByZWdlbmVyYXRlZFJhbmRvbWl6YXRpb24iOnsiaWQiOiJwbGF5ZXJfaWQ9MSZ0aW1lc3RhbXA9MTc1MDY2MDc4MSJ9LCJkYXRhIjpbMyw3XSwibGljZW5zZSI6eyJ0eXBlIjoiZGV2ZWxvcGVyIiwidGV4dCI6IlJhbmRvbSB2YWx1ZXMgbGljZW5zZWQgc3RyaWN0bHkgZm9yIGRldmVsb3BtZW50IGFuZCB0ZXN0aW5nIG9ubHkiLCJpbmZvVXJsIjpudWxsfSwibGljZW5zZURhdGEiOm51bGwsInVzZXJEYXRhIjpudWxsLCJ0aWNrZXREYXRhIjpudWxsLCJjb21wbGV0aW9uVGltZSI6IjIwMjUtMDYtMjMgMDY6NDA6NTFaIiwic2VyaWFsTnVtYmVyIjo3NH0%3D&signature=WPlkelEz7Yx9WUneqcaO0MzFmkuA%2ByTlhMrZFPuIaxZ8UK%2Fv%2BxWP%2FLtCR3P5fCapAtwaHfccYKLsT%2B1k4blg4AhLfxbt7RrUTshDf%2ByTUuBXsOrVoO1jjmbLg43cikwMHcyhJIyT2bMGknvPGfb9B6YCDwoWvV1R8V2v8fU9WPXf5rsfdhT1E30LrPWbnzKMjaOgBHSHFTRokoOObh4AgYiAnCkxcZhaBZKMkqFp4r%2BmCheYf977CkgCfXBsepVlWXrZFEosgnJHVGdCxEYyhaPMl2GTetD07CnAK69SqILvMnUJ5ooOG0gz0cvzW5ZQzLtiYmFyPhneAahWIeQ1g9MdAh%2Fit4YA%2Bm6vLeVeYFyShSFq7%2B2jznv0UL77S7sCWFR0fi0qMuUr7JtfgENWOYSHO813qnsjfl0eqyPe9XxTg4e7CifE5ZOoet7pjKrj3VfPPKa%2BAMw89y5HKHXdjGqIrzdtVaM%2B7ZRdGhBwIRyrSwhXy8XTo%2BaOYdz8rLsdN35Bdf2LxSHJexbhrYD5QyMRUgmYWjvwzau3oMczmRR5wbJyJR67vmUedPxpEOlfScJzMqWc8de4pMV1llEtKjzjg9%2Fbd%2BQTtk%2F%2BGkIMQdEO0aJiblkJw1T8CiHd9pe3ep%2FH9e9uC4ou54UtR9T4ssXg6wrc9I90RNI5D%2BnHDKk%3D",
            data: [3, 7]
          },
        },
        {
          event_type: "score-change",
          timestamp: Math.floor(new Date("04 29 2025 07:07").getTime() / 1000),
          subtype: "street-tax",
          sector_id: 15,
          amount: -20,
          tax_player_id: 2,
          bonuses_used: ["evade-street-tax"],
        },
        {
          event_type: "score-change",
          timestamp: Math.floor(new Date("04 29 2025 02:54").getTime() / 1000),
          subtype: "map-tax",
          sector_id: 15,
          amount: 100,
        },
        {
          event_type: "score-change",
          timestamp: Math.floor(new Date("04 28 2025 11:23").getTime() / 1000),
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
  bonuses_used: string[];
  selected_die: number | null;
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
  game_id: number | null;
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

export async function payTaxes(taxType: TaxType): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest("/api/players/current/pay-taxes", {
    method: "POST",
    body: JSON.stringify({ tax_type: taxType }),
  });
}

export type IGDBGame = {
  id: number;
  name: string;
  cover: string | null;
  release_year: number;
};

type SearchGamesResponse = {
  games: IGDBGame[];
};

export async function searchGames(
  query: string,
  limit: number = 100,
): Promise<SearchGamesResponse> {
  if (MOCK_API) {
    const mockGames: IGDBGame[] = [
      {
        id: 1,
        name: "The Witcher 3: Wild Hunt",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
        release_year: 2015,
      },
      {
        id: 2,
        name: "Cyberpunk 2077",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co7497.webp",
        release_year: 2020,
      },
      {
        id: 3,
        name: "Elden Ring",
        cover: null,
        release_year: 2022,
      },
      {
        id: 4,
        name: "Outlast: Whistleblower",
        cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2jjc.webp",
        release_year: 2014,
      },
    ];

    const filteredGames = mockGames.filter((game) =>
      game.name.toLowerCase().includes(query.toLowerCase()),
    );

    return Promise.resolve({ games: filteredGames });
  }

  const response = await apiRequest(
    `/api/igdb/games/search?query=${encodeURIComponent(query)}&limit=${limit}`,
  );
  return response.json();
}

export async function giveBonusCard(bonusType: BonusCardType): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/bonus-cards`, {
    method: "POST",
    body: JSON.stringify({ bonus_type: bonusType }),
  });
}

export async function stealBonusCard(
  playerId: number,
  bonusType: BonusCardType,
): Promise<void> {
  if (MOCK_API) {
    return Promise.resolve();
  }
  await apiRequest(`/api/bonus-cards/steal`, {
    method: "POST",
    body: JSON.stringify({ bonus_type: bonusType, player_id: playerId }),
  });
}

type DiceRollResponse = {
  roll_id: number;
  is_random_org_result: boolean;
  random_org_check_form?: string;
  data: [number, number];
};

export async function rollDice(): Promise<DiceRollResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      roll_id: 1,
      is_random_org_result: false,
      data: [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1],
    });
  }
  const response = await apiRequest("/api/dice/roll", {
    method: "POST",
    body: JSON.stringify({ num: 2, min: 1, max: 8 }),
  });
  return response.json();
}
