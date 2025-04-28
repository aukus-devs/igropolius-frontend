import { BuildingType, GameLengthWithDrop, TrainData } from "@/lib/types";
import { Color } from "three";

export enum Controls {
  forward = "forward",
  backward = "backward",
  left = "left",
  right = "right",
  up = "up",
  down = "down",
  turnLeft = "turnLeft",
  turnRight = "turnRight",
}

export const SECTORS_PER_SIDE = 9;

export const SECTOR_WIDTH = 8;
export const SECTOR_HEIGHT = 1;
export const SECTOR_DEPTH = 18;

export const BUILDING_SCALE = 1;

export const BOARD_SIZE = SECTORS_PER_SIDE * SECTOR_WIDTH;
export const HALF_BOARD = (SECTORS_PER_SIDE * SECTOR_WIDTH) / 2 + SECTOR_WIDTH / 2;

export const SECTOR_CONTENT_ELEVATION = SECTOR_HEIGHT / 2;

export const PLAYER_WIDTH = 2;
export const PLAYER_HEIGHT = 1;
export const PLAYER_DEPTH = 1.25;
export const PLAYER_ELEVATION = SECTOR_HEIGHT / 2;

export const EMISSION_FULL = new Color("white");
export const EMISSION_NONE = new Color("black");

export const GameLengthToBuildingType: { [key in GameLengthWithDrop]: BuildingType } = {
  drop: "ruins",
  "2-5": "height-1",
  "5-10": "height-2",
  "10-15": "height-3",
  "15-20": "height-4",
  "20-25": "height-5",
  "25+": "height-6",
};

export const TrainsConfig: TrainData[] = [
  {
    sectorFrom: 6,
    sectorTo: 16,
  },
  {
    sectorFrom: 16,
    sectorTo: 26,
  },
  {
    sectorFrom: 26,
    sectorTo: 36,
  },
  {
    sectorFrom: 36,
    sectorTo: 6,
  },
];

const IS_DEV = import.meta.env.MODE === "development";
export const STORAGE_BASE_URL = IS_DEV
  ? `/monopoly_s3/assets`
  : `https://storage.yandexcloud.net/monopoly2025/assets`;
