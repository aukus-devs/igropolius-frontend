const ColorBrown = '#AC8E68';
const ColorLightBlue = '#64D2FF';
const ColorPink = '#BF5AF2';
const ColorOrange = '#FF9F0A';
const ColorRed = '#FF453A';
const ColorYellow = '#FFD60A';
const ColorGreen = '#30D158';
const ColorBlue = '#0A84FF';
const ColorPastelGreen = '#AAD4A3';

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
  red: '#FF453A',
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  green: '#30D158',
  lightBlue: '#64D2FF',
  blue: '#0A84FF',
  darkBlue: '#5E5CE6',
  purple: '#BF5AF2',
  pink: '#FF375F',
  brown: '#AC8E68',
} as const;

export type PlayerColor = keyof typeof playerColors;
export type PlayerColorValue = (typeof playerColors)[PlayerColor];

export type CellRollType = 'auc' | 'steam' | 'voting';

type Position = {
  x: number;
  y: number;
};

export type SectorData = {
  id: number;
  type: 'prison' | 'property' | 'railroad' | 'bonus' | 'start-corner' | 'parking';
  name: string;
  position: Position;
  color: ColorName;
  rollType: CellRollType;
};

export type GameLength = '2-5' | '5-10' | '10-15' | '15-20' | '20-25' | '25+';
export type GameLengthWithDrop = GameLength | 'drop';

export type GameStatusType = 'drop' | 'completed' | 'reroll';
export type GameReviewType = {
  gameTitle: string;
  description: string;
  rating: number;
  points: number;
  poster?: string;
  status: GameStatusType;
  date: Date;
  duration: number | null;
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
  cover: string | null;
};

export type BackendPlayerData = {
  id: number;
  username: string;
  first_name: string;
  is_online: boolean;
  avatar_link: string | null;
  role: UserRole;

  current_game: string | null;
  current_game_updated_at: number | null;
  current_game_cover: string | null;
  current_game_duration: number | null;
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
  maps_completed: number;
};

export type UserRole = 'player' | 'admin' | 'moder' | 'prison';

export type PlayerFrontendData = {
  color: PlayerColorValue;
};

export type PlayerData = BackendPlayerData & PlayerFrontendData;

export type Vector3Array = [number, number, number];

export type BuildingType =
  | 'ruins'
  | 'small_buildingD'
  | 'skyscraperD'
  | 'skyscraperB'
  | 'skyscraperA'
  | 'skyscraperE'
  | 'skyscraperX';

export type BuildingData = {
  type: BuildingType;
  owner: PlayerData;
  sectorId: number;
  createdAt: number;
  gameLength: GameLength | 'drop';
  gameTitle: string;
};

export type TrainData = {
  sectorFrom: number;
  sectorTo: number;
};

export type TaxData = {
  taxAmount: number;
  playerIncomes: Record<number, number>;
};

export type EventType = 'game' | 'bonus-card' | 'player-move' | 'score-change';

export type PlayerEventBase = {
  event_type: EventType;
  timestamp: number;
};

export type PlayerEventGame = PlayerEventBase & {
  event_type: 'game';
  subtype: GameStatusType;
  game_title: string;
  game_review: string;
  game_score: number;
  game_cover: string | null;
  duration: number;
  sector_id: number;
  bonuses_used?: BonusCardType[];
};

export type RollBonusType = 'adjust-roll-by1' | 'choose-1-die';

export type BonusCardType =
  | RollBonusType
  | 'skip-prison-day'
  | 'reroll-game'
  | 'evade-street-tax'
  | 'evade-map-tax'
  | 'game-help-allowed';

export type InstantCardType =
  | 'receive-1-percent-from-all'
  | 'receive-scores-for-place'
  | 'receive-5-percent-or-reroll'
  | 'receive-3-percent'
  | 'leaders-lose-percents'
  | 'receive-1-percent-plus-20'
  | 'upgrade-next-building'
  | 'downgrade-next-building'
  | 'lose-2-percents'
  | 'reroll'
  | 'reroll-and-roll'
  | 'lose-card-or-3-percent';

export type AllCardsType = BonusCardType | InstantCardType;

export type DiceRollJson = {
  is_random_org_result: boolean;
  random_org_check_form?: string;
  data: [number, number];
};

export type PlayerEventBonusCard = PlayerEventBase & {
  event_type: 'bonus-card';
  subtype: 'received' | 'used' | 'dropped' | 'stolen-by-me' | 'stolen-from-me';
  bonus_type: BonusCardType | InstantCardType;
  sector_id: number;
  used_at: number | null;
  used_on_sector: number | null;
  lost_at: number | null;
  lost_on_sector: number | null;
  stolen_at: number | null;
  stolen_from_player: number | null;
  stolen_by: number | null;
};

export type PlayerEventMove = PlayerEventBase & {
  event_type: 'player-move';
  subtype: 'dice-roll' | 'train-ride' | 'drop-to-prison';
  sector_from: number;
  sector_to: number;
  adjusted_roll: number;
  dice_roll?: number[];
  dice_roll_json?: DiceRollJson;
  completed_map: boolean;
  bonuses_used: BonusCardType[];
};

export type TaxType = 'street-tax' | 'map-tax';

export type PlayerEventScoreChange = PlayerEventBase & {
  event_type: 'score-change';
  subtype: TaxType | 'game-completed' | 'game-dropped' | 'street-income' | 'instant-card';
  amount: number;
  tax_player_id?: number;
  sector_id: number;
  bonuses_used?: BonusCardType[];
  score_before: number;
  score_after: number;
};

export type PlayerEvent =
  | PlayerEventGame
  | PlayerEventMove
  | PlayerEventScoreChange
  | PlayerEventBonusCard;

export type PlayerTurnState =
  | 'rolling-dice'
  | 'using-dice-bonuses'
  | 'using-prison-bonuses'
  | 'rolling-bonus-card'
  // | 'using-reroll-bonuses'
  | 'filling-game-review'
  | 'choosing-train-ride'
  | 'using-map-tax-bonuses'
  | 'using-street-tax-bonuses'
  | 'dropping-card-after-game-drop'
  | 'dropping-card-after-instant-roll'
  | 'entering-prison'
  | 'stealing-bonus-card'
  | 'choosing-building-sector'
  | 'using-map-tax-bonuses-after-train-ride';

export type PlayerStateAction =
  | 'skip-bonus'
  | 'skip-prison'
  | 'drop-game'
  | 'reroll-game'
  | 'drop-card';

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

export type ScoreDetails = {
  base: number;
  sectorMultiplier: number;
  mapCompletionBonus: number;
  total: number;
};

export type EventDescription = {
  title: string;
  description: string;
  gameCover?: string;
};

export type MoveMyPlayerParams = {
  totalRoll: number;
  // bonusesUsed: RollBonusType[];
  selectedDie: number | null;
  adjustBy1: 1 | -1 | null;
  action?: PlayerStateAction;
};

export type NotificationType = 'important' | 'standard';

export type NotificationEventType =
  | 'game-completed'
  | 'game-reroll'
  | 'game-drop'
  | 'pay-sector-tax'
  | 'building-income'
  | 'pay-map-tax'
  | 'bonus-increase'
  | 'card-stolen'
  | 'card-lost'
  | 'event-ending-soon'
  | 'message';

export type NotificationItem = {
  id: number;
  notification_type: NotificationType;
  event_type: NotificationEventType;
  created_at: number;
  other_player_id?: number;
  scores?: number;
  sector_id?: number;
  game_title?: string;
  card_name?: string;
  event_end_time?: number;
  message_text?: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
};

export type MyPlayerData = {
  id: number;
  nickname: string;
  url_handle: string;
  turn_state: PlayerTurnState;
  last_roll_result: number[];
  role: UserRole;
  has_upgrade_bonus: boolean;
  has_downgrade_bonus: boolean;
};

export type InstantCardResult =
  | 'default'
  | 'reroll'
  | 'card-lost'
  | 'score-received'
  | 'score-lost';

export type ManualUseCard = 'reroll-game' | 'game-help-allowed';
