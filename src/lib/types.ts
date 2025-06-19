const ColorBrown = "#AC8E68";
const ColorLightBlue = "#64D2FF";
const ColorPink = "#BF5AF2";
const ColorOrange = "#FF9F0A";
const ColorRed = "#FF453A";
const ColorYellow = "#FFD60A";
const ColorGreen = "#30D158";
const ColorBlue = "#0A84FF";
const ColorPastelGreen = "#AAD4A3";

export const colors = {
  brown: ColorBrown,
  lightblue: ColorLightBlue,
  pink: ColorPink,
  orange: ColorOrange,
  red: ColorRed,
  yellow: ColorYellow,
  green: ColorGreen,
  blue: ColorBlue,
  pastelgreen: ColorPastelGreen,
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
  type: "prison" | "property" | "railroad" | "bonus" | "start-corner" | "parking";
  name: string;
  position: Position;
  color: ColorName;
  rollType: CellRollType;
};

export type GameLength = "2-5" | "5-10" | "10-15" | "15-20" | "20-25" | "25+";
export type GameLengthWithDrop = GameLength | "drop";

export type GameStatusType = "drop" | "completed" | "reroll";
export type GameReviewType = {
  gameTitle: string;
  description: string;
  rating: number;
  points: number;
  poster?: string;
  status: GameStatusType;
  date: Date;
};

export type PlayerGame = {
  created_at: number;
  sector_id: number;
  status: GameStatusType;
  title: string;
  length: GameLengthWithDrop;
  review: string;
  rating: number;
  duration: number | null;
  vod_links: string | null;
};

export type BackendPlayerData = {
  id: number;
  username: string;
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
  sector_id: number;
  games: PlayerGame[];
  bonus_cards: ActiveBonusCard[];
};

export type PlayerFrontendData = {
  avatar_link: string;
  color: PlayerColorValue;
};

export type PlayerData = BackendPlayerData & PlayerFrontendData;

export type Vector3Array = [number, number, number];

export type BuildingType =
  | "ruins"
  // | "small"
  | "large"
  | "skyscraperD"
  | "skyscraperF"
  | "skyscraperA"
  | "skyscraperE"
  | "skyscraperX";

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

type EventType = "game" | "bonus-card" | "player-move" | "score-change";

export type PlayerEventBase = {
  event_type: EventType;
  timestamp: number;
  sector_id: number;
};

export type PlayerEventGame = PlayerEventBase & {
  event_type: "game";
  subtype: GameStatusType;
  game_title: string;
  game_review: string;
  game_score: number;
  duration: number;
};

export type BonusCardType =
  | "adjust-roll-by1"
  | "choose-1-die"
  | "skip-prison-day"
  | "reroll-game"
  | "evade-street-tax"
  | "evade-map-tax"
  | "game-help-allowed";

export type PlayerEventBonusCard = PlayerEventBase & {
  event_type: "bonus-card";
  subtype: "received" | "used" | "lost";
  bonus_type: BonusCardType;
};

export type PlayerEventMove = PlayerEventBase & {
  event_type: "player-move";
  subtype: "dice-roll" | "train-ride";
  sector_to: number;
  adjusted_roll: number;
  dice_roll?: number[];
  completed_map: boolean;
};

export type TaxType = "street-tax" | "map-tax";

export type PlayerEventScoreChange = PlayerEventBase & {
  event_type: "score-change";
  subtype: TaxType | "game-completed" | "game-dropped";
  amount: number;
  tax_player_id?: number;
};

export type PlayerEvent =
  | PlayerEventGame
  | PlayerEventMove
  | PlayerEventScoreChange
  | PlayerEventBonusCard;

export type PlayerTurnState =
  | "rolling-dice"
  | "using-dice-bonuses"
  | "using-prison-bonuses"
  | "rolling-bonus-card"
  | "using-reroll-bonuses"
  | "filling-game-review"
  | "choosing-train-ride"
  | "using-map-tax-bonuses"
  | "using-street-tax-bonuses"
  | "entering-prison"
  | "stealing-bonus-card"
  | "choosing-building-sector"
  | "using-map-tax-bonuses-after-train-ride";

export type PlayerStateAction = "skip-bonus" | "skip-prison" | "drop-game" | "reroll-game";

export type ActiveBonusCard = {
  bonus_type: BonusCardType;
  received_at: number;
  received_on_sector: number;
};

export type FrontendCardData = {
  name: string;
  picture: string;
  description: string;
};

export type RulesVersion = {
  content: string;
  created_at: number;
};
