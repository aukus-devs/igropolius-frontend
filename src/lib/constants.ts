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

export const FLOOR_SIZE = 60;
export const FLOOR_HEIGHT = 0.5;
export const SECTOR_HEIGHT = 0.1;
export const PLAYER_HEIGHT = 0.25;
export const SECTOR_ELEVATION = FLOOR_HEIGHT / 2 + SECTOR_HEIGHT / 2;
export const PLAYER_ELEVATION = PLAYER_HEIGHT + SECTOR_ELEVATION * 2;
