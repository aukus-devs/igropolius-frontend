import { BonusType, GameCompletionType, GameLength, PlayerDetails } from './api-types-generated';

const ColorBrown = '#8f553f';
const ColorLightBlue = '#1cb5d4';
const ColorPink = '#c9268e';
const ColorOrange = '#e07516';
const ColorRed = '#c72424';
const ColorYellow = '#e8c413';
const ColorGreen = '#26bf3b';
const ColorBlue = '#1965b5';
const ColorPastelGreen = '#7fb58b';

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

export type GameRollType = 'auc' | 'steam';

type Position = {
  x: number;
  y: number;
};

export type GameLengthRange = {
  min: number;
  max: number;
};

export type SectorData = {
  id: number;
  type: 'prison' | 'property' | 'railroad' | 'bonus' | 'start-corner' | 'parking';
  name: string;
  position: Position;
  color?: ColorName;
  rollType: GameRollType;
  gameLengthRanges?: GameLengthRange; // for roll on https://gamegauntlets.com
};

export type GameReviewType = {
  gameTitle: string;
  description: string;
  rating: number;
  points: number;
  poster?: string;
  status: GameCompletionType;
  date: Date;
  duration: number | null;
};

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
  id: number;
  type: BuildingType;
  owner: PlayerDetails;
  sectorId: number;
  createdAt: number;
  gameLength: GameLength;
  gameTitle: string;
  income: number;
  hasGroupBonus: boolean;
};

export type TrainData = {
  sectorFrom: number;
  sectorTo: number;
};

export type TaxData = {
  taxAmount: number;
  playerIncomes: Record<number, number>;
};

export type RollBonusType = 'adjust-roll-by1' | 'choose-1-die';

export type PlayerStateAction =
  | 'skip-bonus'
  | 'skip-prison'
  | 'drop-game'
  | 'reroll-game'
  | 'drop-card';

export type FrontendCardData = {
  name: string;
  picture: string;
  description: string;
};

export type ScoreDetails = {
  base: number;
  sectorMultiplier: number;
  mapCompletionBonus: number;
  total: number;
};

export type EventDescription = {
  timeHeader?: string;
  title: string;
  description: string;
  image?: string;
  sectorId?: number;
  bonusType?: BonusType;
};

export type MoveMyPlayerParams = {
  sectorTo: number;
  rideTrain?: boolean;
};

export type ManualUseCard = 'reroll-game' | 'game-help-allowed';
