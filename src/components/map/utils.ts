import {
  PLAYER_ELEVATION,
  SECTOR_ELEVATION,
  SECTOR_OFFSET,
  SECTOR_WIDTH,
  SECTOR_CONTENT_ELEVATION,
  SECTOR_DEPTH,
} from "@/lib/constants";
import { SectorData, Vector3Array } from "@/types";

export function calculateSectorPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET;
  const elevation = SECTOR_ELEVATION;

  const halfWidth = SECTOR_WIDTH / 2;

  const cornerOffset = offset;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0
        ? -cornerOffset
        : sector.position.x === 10
          ? (SECTOR_DEPTH - SECTOR_WIDTH * 2) / 2
          : -halfWidth),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0
        ? -cornerOffset
        : sector.position.y === 10
          ? (SECTOR_DEPTH - SECTOR_WIDTH * 2) / 2
          : -halfWidth),
  ];
}

export function calculatePlayerPosition(sector: SectorData): Vector3Array {
  const offset = SECTOR_OFFSET;
  const elevation = PLAYER_ELEVATION;
  const cornerOffset = offset;

  const halfWidth = SECTOR_WIDTH / 2;

  const movePlayerDown = -SECTOR_DEPTH / 2 + 6;

  return [
    sector.position.x * SECTOR_WIDTH +
      (sector.position.x === 0
        ? -cornerOffset + movePlayerDown
        : sector.position.x === 10
          ? -movePlayerDown
          : -halfWidth),
    elevation,
    sector.position.y * SECTOR_WIDTH +
      (sector.position.y === 0
        ? -cornerOffset + movePlayerDown
        : sector.position.y === 10
          ? -movePlayerDown
          : -halfWidth),
  ];
}

export function calculateTrainPosition(sector: SectorData): Vector3Array {
  const pos = calculateSectorPosition(sector);
  return [pos[0], SECTOR_CONTENT_ELEVATION, pos[2] + 7];
}
