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
