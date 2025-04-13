import { playersData, sectorsData } from "@/lib/mockData";
import Sector from "./Sector";
import { FLOOR_SIZE, PLAYER_ELEVATION, SECTOR_DEPTH, SECTOR_ELEVATION, SECTOR_WIDTH } from "@/lib/constants";
import { Vector3Array } from "@/types";
import useAppStore from "@/stores/appStore";
import { PlayerModel } from "./PlayerModel";

type SectorPosition =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

function GameBoard() {
  const selectedSector = useAppStore((state) => state.selectedSector);
  const setSelectedSectorId = useAppStore((state) => state.setSelectedSectorId);
  const sectorsPerSide = 12;
  const centerPosition = (FLOOR_SIZE / sectorsPerSide) * SECTOR_WIDTH;

  return (
    <group
      position={[-centerPosition, SECTOR_ELEVATION, -centerPosition]}
    >
      <group name="players">
        {playersData.map((player, idx) => {
          const sector = sectorsData.find((s) => s.id === player.sectorId);
          if (!sector) throw new Error(`Sector with id ${player.sectorId} not found`);

          return (
            <PlayerModel
              key={idx}
              player={player}
              position={[
                sector.position.x * SECTOR_WIDTH,
                PLAYER_ELEVATION,
                sector.position.y * SECTOR_WIDTH
              ]}
            />
          )
        })}
      </group>

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

        const sectorSize: Vector3Array = [SECTOR_WIDTH, 0.1, SECTOR_DEPTH];
        const cornerSize: Vector3Array = [SECTOR_DEPTH, 0.1, SECTOR_DEPTH];
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
          offsetY = -(SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isRightSector) {
          offsetX = -(SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isLeftSector) {
          offsetX = (SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isTopSector) {
          offsetY = (SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        return (
          <Sector
            sector={sector}
            key={sector.id}
            position={[
              sector.position.x * SECTOR_WIDTH + offsetX,
              SECTOR_ELEVATION,
              sector.position.y * SECTOR_WIDTH + offsetY,
            ]}
            rotation={rotation}
            shape={boxShape}
            onClick={() => setSelectedSectorId(sector.id)}
            onPointerOver={() => setSelectedSectorId(sector.id)}
            isSelected={selectedSector?.id === sector.id}
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
