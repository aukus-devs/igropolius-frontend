import { AppContext } from "@/contexts/AppContext";
import { playersData, sectorsData } from "@/lib/mockData";
import { useContext } from "react";
import Sector from "./Sector";
import { FLOOR_SIZE, SECTOR_ELEVATION } from "@/lib/constants";
import { Vector3Array } from "@/types";

type SectorPosition =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

interface Props {
  sectorWidth?: number;
  sectorHeight?: number;
  scale?: number;
}

function GameBoard({ sectorWidth = 6, sectorHeight = 12, scale = 1 }: Props) {
  const { selectedSector, setSelectedSectorId } = useContext(AppContext);
  const sectorsPerSide = 12;
  const centerPosition = (FLOOR_SIZE / sectorsPerSide) * sectorWidth;

  return (
    <group
      position={[-centerPosition, SECTOR_ELEVATION, -centerPosition]}
      scale={[scale, 1, scale]}
    >
      {sectorsData.map((sector) => {
        const isBottomSector = sector.position.y === 0;
        const isRightSector = sector.position.x === 0;
        const isLeftSector = sector.position.x === 10;
        const isTopSector = sector.position.y === 10;

        const isCorner =
          (isBottomSector && isLeftSector) ||
          (isBottomSector && isRightSector) ||
          (isTopSector && isLeftSector) ||
          (isTopSector && isRightSector);

        const sectorSize: Vector3Array = [sectorWidth, 0.1, sectorHeight];
        const cornerSize: Vector3Array = [sectorHeight, 0.1, sectorHeight];
        const boxShape: Vector3Array = isCorner ? cornerSize : sectorSize;

        let boardPosition: SectorPosition = "bottom";
        if (isLeftSector) boardPosition = "left";
        if (isRightSector) boardPosition = "right";
        if (isTopSector) boardPosition = "top";
        if (isBottomSector) boardPosition = "bottom";
        if (isCorner) {
          if (isBottomSector && isLeftSector) boardPosition = "bottom-left";
          if (isBottomSector && isRightSector) boardPosition = "bottom-right";
          if (isTopSector && isLeftSector) boardPosition = "top-left";
          if (isTopSector && isRightSector) boardPosition = "top-right";
        }

        const rotation = getSectorRotation(boardPosition);
        let offsetX = 0;
        let offsetY = 0;

        if (isBottomSector) {
          offsetY = -(sectorHeight - sectorWidth) / 2;
        }

        if (isLeftSector) {
          offsetX = (sectorHeight - sectorWidth) / 2;
        }

        if (isRightSector) {
          offsetX = -(sectorHeight - sectorWidth) / 2;
        }

        if (isTopSector) {
          offsetY = (sectorHeight - sectorWidth) / 2;
        }

        const players_ids = sector.players;
        const players = players_ids
          .map((id) => playersData.find((player) => player.id === id))
          .filter((p) => p !== undefined);

        return (
          <Sector
            sector={sector}
            players={players}
            key={sector.id}
            position={[
              sector.position.x * sectorWidth + offsetX,
              SECTOR_ELEVATION,
              sector.position.y * sectorWidth + offsetY,
            ]}
            rotation={rotation}
            shape={boxShape}
            onClick={() => setSelectedSectorId(sector.id)}
            onPointerOver={() => setSelectedSectorId(sector.id)}
            isSelected={selectedSector?.id === sector.id}
            isCorner={isCorner}
          />
        );
      })}
    </group>
  );
}

export default GameBoard;

const bottomRotation: Vector3Array = [0, 0, 0];
const topRotation: Vector3Array = [0, Math.PI, 0];
const leftRotation: Vector3Array = [0, -Math.PI / 2, 0];
const rightRotation: Vector3Array = [0, Math.PI / 2, 0];

// start sector
const bottomRightRotation: Vector3Array = [0, 0, 0];
// prison visit
const bottomLeftRotation: Vector3Array = [0, -Math.PI / 2, 0];
// parking
const topLeftRotation: Vector3Array = [0, -Math.PI, 0];
// prison
const topRightRotation: Vector3Array = [0, Math.PI / 2, 0];

function getSectorRotation(pos: SectorPosition): Vector3Array {
  switch (pos) {
    case "bottom":
      return bottomRotation;
    case "top":
      return topRotation;
    case "left":
      return leftRotation;
    case "right":
      return rightRotation;
    case "bottom-left":
      return bottomLeftRotation;
    case "bottom-right":
      return bottomRightRotation;
    case "top-left":
      return topLeftRotation;
    case "top-right":
      return topRightRotation;
    default:
      return [0, 0, 0];
  }
}
