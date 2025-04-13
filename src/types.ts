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

type ColorName =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "biege"
  | "pastelgreen"
  | "highlight";

type CellColor =
  | typeof ColorBrown
  | typeof ColorLightBlue
  | typeof ColorPink
  | typeof ColorOrange
  | typeof ColorRed
  | typeof ColorYellow
  | typeof ColorGreen
  | typeof ColorBlue
  | typeof ColorBiege
  | typeof ColorPastelGreen
  | typeof ColorHighlight;

export const colors: Record<ColorName, CellColor> = {
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

export type CellRollType = "auc" | "steam" | "voting";

type Position = {
  x: number;
  y: number;
};

export type SectorData = {
  id: number;
  type: "corner" | "property" | "community_chest" | "tax" | "railroad" | "chance" | "utility";
  name: string;
  players: string[];
  position: Position;
  color: CellColor;
  rollType: CellRollType;
};

export type PlayerData = {
  id: string;
  name: string;
  color: string;
  sectorId: number;
};

export type Vector3Array = [number, number, number];
