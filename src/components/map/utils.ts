import {
  PLAYER_ELEVATION,
  SECTOR_ELEVATION,
  SECTOR_OFFSET,
  SECTOR_WIDTH,
  TRAIN_ELEVATION,
} from "@/lib/constants";
import { SectorData, Vector3Array } from "@/types";

export function calculateSectorPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET;
  const elevation = SECTOR_ELEVATION;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0 ? -offset : sector.position.x === 10 ? offset : 0),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0 ? -offset : sector.position.y === 10 ? offset : 0),
  ];
}

export function calculatePlayerPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET * 2;
  const elevation = PLAYER_ELEVATION;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0 ? -offset : sector.position.x === 10 ? offset : 0),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0 ? -offset : sector.position.y === 10 ? offset : 0),
  ];
}

export function calculateTrainPosition(sector: SectorData): Vector3Array {
  const pos = calculateSectorPosition(sector);
  return [pos[0], TRAIN_ELEVATION, pos[2] + 7];
}
