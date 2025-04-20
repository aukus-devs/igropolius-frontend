const ColorBrown = "#8B4513";
const ColorLightBlue = "#00BFFF";
const ColorPink = "#FF1493";
const ColorOrange = "#FF6600";
const ColorRed = "#FF0000";
const ColorYellow = "#DAA520";
const ColorGreen = "#008000";
const ColorBlue = "#0000FF";
const ColorBiege = "#F5F5DC";
const ColorPastelGreen = "#AAD4A3";
const ColorHighlight = "#9400D3";

export const colors = {
  brown: ColorBrown,
  lightblue: ColorLightBlue,
  pink: ColorPink,
  orange: ColorOrange,
  red: ColorRed,
  yellow: ColorYellow,
  green: ColorGreen,
  blue: ColorBlue,
  biege: ColorBiege,
  pastelgreen: ColorPastelGreen,
  highlight: ColorHighlight,
};

// Type for the keys of the map
export type ColorName = keyof typeof colors;

// Type for the values of the map
export type CellColor = (typeof colors)[ColorName];

export const playerColors = {
  red: "#FF453A",
  orange: "#FF9F0A",
  yellow: "#FFD60A",
  green: "#30D158",
  lightBlue: "#64D2FF",
  blue: "#0A84FF",
  darkBlue: "#5E5CE6",
  purple: "#BF5AF2",
  pink: "#FF375F",
  brown: "#AC8E68",
} as const;

export type PlayerColor = keyof typeof playerColors;
export type PlayerColorValue = (typeof playerColors)[PlayerColor];

export type CellRollType = "auc" | "steam" | "voting";

type Position = {
  x: number;
  y: number;
};

export type SectorData = {
  id: number;
  type: "prison" | "property" | "railroad" | "bonus" | "utility";
  name: string;
  position: Position;
  color: CellColor;
  rollType: CellRollType;
};

export type GameLength = "2-5" | "5-10" | "10-15" | "15-20" | "20-25" | "25+";
export type GameLengthWithDrop = GameLength | "drop";

export type GameStatusType = "drop" | "in_progress" | "completed" | "reroll";
export type GameReviewType = {
  gameTitle: string;
  description: string;
  rating: number;
  points: number;
  poster?: string;
  status: GameStatusType;
  date: Date;
};

export type SectorOwnership = {
  created_at: number;
  sector_id: number;
  game_title: string;
  game_length: GameLengthWithDrop;
};

export type PlayerData = {
  id: number;
  nickname: string;
  first_name: string;
  is_online: boolean;

  current_game: string | null;
  current_game_updated_at: number | null;
  online_count: number | null;
  current_auc_total_sum: number | null;
  current_auc_started_at: number | null;
  pointauc_token: string | null;

  twitch_stream_link: string | null;
  vk_stream_link: string | null;
  kick_stream_link: string | null;
  telegram_link: string | null;
  donation_link: string | null;

  total_score: number;
  current_position: number;
  sector_ownership: SectorOwnership[];

  avatar_link: string;
  color: PlayerColorValue;
};

export type Vector3Array = [number, number, number];

export type DeckCardData = {
  id: string;
  name: string;
  picture: string;
  description: string;
};

export type BuildingType =
  | "ruins"
  | "height-1"
  | "height-2"
  | "height-3"
  | "height-4"
  | "height-5"
  | "height-6";

export type BuildingData = {
  type: BuildingType;
  owner: PlayerData;
  sectorId: number;
  createdAt: number;
  gameLength: GameLength | "drop";
  gameTitle: string;
};

export type TrainData = {
  sectorFrom: number;
  sectorTo: number;
};
