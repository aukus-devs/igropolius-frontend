import { BuildingType, GameLengthWithDrop, TrainData } from "@/types";
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

export const SECTORS_PER_SIDE = 12;

export const FLOOR_HEIGHT = 1;

export const SECTOR_WIDTH = 6;
export const SECTOR_HEIGHT = 1;
export const SECTOR_DEPTH = 16;
export const SECTOR_OFFSET = SECTOR_DEPTH / 2;
export const SECTOR_ELEVATION = 0;

export const FLOOR_SIZE = SECTOR_WIDTH * 9;

export const SECTOR_CONTENT_ELEVATION = SECTOR_HEIGHT / 2;

export const PLAYER_HEIGHT = 1;
export const PLAYER_ELEVATION = SECTOR_HEIGHT / 2 + SECTOR_HEIGHT;

export const FLOOR_CENTER_POSITION = FLOOR_SIZE / 2;

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
