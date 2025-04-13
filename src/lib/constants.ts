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

export const SECTORS_PER_SIDE = 12
  ;
export const FLOOR_SIZE = 60;
export const FLOOR_HEIGHT = 0.5;

export const SECTOR_WIDTH = 6;
export const SECTOR_HEIGHT = 0.1;
export const SECTOR_DEPTH = 12;
export const SECTOR_OFFSET = (SECTOR_DEPTH - SECTOR_WIDTH) / 2;
export const SECTOR_ELEVATION = FLOOR_HEIGHT / 2 + SECTOR_HEIGHT / 2;

export const PLAYER_HEIGHT = 1;
export const PLAYER_ELEVATION = SECTOR_HEIGHT * 2 + SECTOR_ELEVATION * 2 + PLAYER_HEIGHT / 2;

export const FLOOR_CENTER_POSITION = (FLOOR_SIZE / SECTORS_PER_SIDE) * SECTOR_WIDTH;
