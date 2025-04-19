import {
  PLAYER_ELEVATION,
  SECTOR_ELEVATION,
  SECTOR_OFFSET,
  SECTOR_WIDTH,
  SECTOR_CONTENT_ELEVATION,
} from "@/lib/constants";
import { SectorData, Vector3Array } from "@/types";

export function calculateSectorPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET;
  const elevation = SECTOR_ELEVATION;

  const cornerOffset = offset * 2;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0 ? -cornerOffset : sector.position.x === 10 ? 0 : -offset),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0 ? -cornerOffset : sector.position.y === 10 ? 0 : -offset),
  ];
}

export function calculatePlayerPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET;
  const elevation = PLAYER_ELEVATION;
  const cornerOffset = offset * 2;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0 ? -cornerOffset : sector.position.x === 10 ? 0 : -offset),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0 ? -cornerOffset : sector.position.y === 10 ? 0 : -offset),
  ];
}

export function calculateTrainPosition(sector: SectorData): Vector3Array {
  const pos = calculateSectorPosition(sector);
  return [pos[0], SECTOR_CONTENT_ELEVATION, pos[2] + 7];
}
