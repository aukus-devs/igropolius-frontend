import {
  PLAYER_ELEVATION,
  SECTOR_WIDTH,
  SECTOR_CONTENT_ELEVATION,
  SECTOR_DEPTH,
  PLAYER_WIDTH,
  PLAYER_DEPTH,
} from "@/lib/constants";
import { SectorData, Vector3Array } from "@/types";

export type SectorPosition =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

export function calculateSectorPosition(sector: SectorData): Vector3Array {
  const offset = (SECTOR_DEPTH - SECTOR_WIDTH) / 2;

  const posX = sector.position.x * SECTOR_WIDTH;
  const posY = sector.position.y * SECTOR_WIDTH;

  let x = 0;
  let z = 0;

  if (sector.position.x === 0) {
    x = -offset;
  } else if (sector.position.x === 10) {
    x = offset;
  }

  if (sector.position.y === 0) {
    z = -offset;
  } else if (sector.position.y === 10) {
    z = offset;
  }

  return [posX + x, 0, posY + z];
}

const MAX_COLUMNS = 2;
const COL_SPACING = PLAYER_WIDTH + 1.5;
const ROW_SPACING = PLAYER_DEPTH + 1;
const OFFSET_FROM_TOP = SECTOR_DEPTH / 2.5;

export function calculatePlayerPosition(
  idx: number,
  totalPlayers: number,
  sector: SectorData
): Vector3Array {
  const { rowOffset, columnOffset } = calculateGridOffsets(idx, totalPlayers);
  const { x: baseX, z: baseZ } = calculateBasePosition(sector);
  const { offsetX, offsetZ } = calculatePlayerOffsets(
    rowOffset,
    columnOffset,
    sector,
    totalPlayers
  );

  return [
    sector.position.x * SECTOR_WIDTH + baseX + offsetX,
    PLAYER_ELEVATION,
    sector.position.y * SECTOR_WIDTH + baseZ + offsetZ,
  ];
}

function calculateGridOffsets(idx: number, totalPlayers: number) {
  const columns = Math.min(totalPlayers, MAX_COLUMNS);
  const rows = Math.ceil(totalPlayers / columns);

  const row = Math.floor(idx / columns);
  const column = idx % columns;

  const rowOffset = row * ROW_SPACING;
  const columnOffset = column * COL_SPACING;

  const widthOffset = ((columns - 1) * COL_SPACING) / 2;
  const heightOffset = ((rows - 1) * ROW_SPACING) / 2;

  return {
    rowOffset: rowOffset - heightOffset,
    columnOffset: columnOffset - widthOffset,
  };
}

function calculateBasePosition(sector: SectorData) {
  const { x: sectorX, y: sectorY } = sector.position;
  let x = 0;
  let z = 0;

  // Handle edge positions
  if (sectorX === 0) x = -OFFSET_FROM_TOP;
  if (sectorX === 10) x = OFFSET_FROM_TOP;
  if (sectorY === 0) z = -OFFSET_FROM_TOP;
  if (sectorY === 10) z = OFFSET_FROM_TOP;

  // Handle corner positions
  if (sectorX === 0 && sectorY === 0) {
    x = -SECTOR_DEPTH / 3;
    z = -SECTOR_DEPTH / 3;
  } else if (sectorX === 0 && sectorY === 10) {
    x = -SECTOR_DEPTH / 3;
    z = SECTOR_DEPTH / 3;
  } else if (sectorX === 10 && sectorY === 0) {
    x = SECTOR_DEPTH / 3;
    z = -SECTOR_DEPTH / 3;
  } else if (sectorX === 10 && sectorY === 10) {
    x = SECTOR_DEPTH / 3;
    z = SECTOR_DEPTH / 3;
  }

  return { x, z };
}

function calculatePlayerOffsets(
  rowOffset: number,
  columnOffset: number,
  sector: SectorData,
  totalPlayers: number
) {
  const { x: sectorX, y: sectorY } = sector.position;
  let offsetX = 0;
  let offsetZ = 0;

  if (totalPlayers > 0) {
    if (sectorX === 0) {
      offsetX = rowOffset;
      offsetZ = -columnOffset;
    } else if (sectorX === 10) {
      offsetX = -rowOffset;
      offsetZ = columnOffset;
    }

    if (sectorY === 0) {
      offsetX = columnOffset;
      offsetZ = rowOffset;
    } else if (sectorY === 10) {
      offsetX = -columnOffset;
      offsetZ = -rowOffset;
    }
  }

  return { offsetX, offsetZ };
}

export function getSectorRotation(position: SectorData["position"]): Vector3Array {
  const { x, y } = position;

  if (x === 0 && y === 0) return [0, 0, 0]; // bottom-left
  if (x === 0 && y === 10) return [0, Math.PI / 2, 0]; // top-left
  if (x === 10 && y === 0) return [0, -Math.PI / 2, 0]; // bottom-right
  if (x === 10 && y === 10) return [0, Math.PI, 0]; // top-right
  if (x === 0) return [0, Math.PI / 2, 0]; // left
  if (x === 10) return [0, -Math.PI / 2, 0]; // right
  if (y === 0) return [0, 0, 0]; // bottom
  if (y === 10) return [0, Math.PI, 0]; // top

  throw new Error("Sector position not found");
}

export function calculateTrainPosition(sector: SectorData): Vector3Array {
  const pos = calculateSectorPosition(sector);
  return [pos[0], SECTOR_CONTENT_ELEVATION, pos[2] + 7];
}
