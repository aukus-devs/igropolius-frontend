import { PlayerData, PlayerEvent } from "@/types";
import { playersData } from "./mockData";

const IS_DEV = import.meta.env.MODE === "development";
const MOCK_API = IS_DEV || true;

type PlayerEventsResponse = {
  events: PlayerEvent[];
};

export async function fetchPlayerEvents(playerId: number): Promise<PlayerEventsResponse> {
  if (MOCK_API) {
    return Promise.resolve({
      events: [],
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
