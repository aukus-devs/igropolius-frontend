import { AppContext } from "@/contexts/AppContext";
import { playersData, sectorsData } from "@/lib/mockData";
import { useContext } from "react";
import Sector from "./Sector";
import { FLOOR_SIZE, SECTOR_ELEVATION } from "@/lib/constants";
import { Vector3Array } from "@/types";

interface Props {
  sectorWidth?: number;
  sectorHeight?: number;
  scale?: number;
}

function GameBoard({ sectorWidth = 6, sectorHeight = 6, scale = 1 }: Props) {
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
        const isLeftSector = sector.position.x === 0;
        const isRightSector = sector.position.x === 10;
        const isTopSector = sector.position.y === 10;

        const isCorner =
          (isBottomSector && isLeftSector) ||
          (isBottomSector && isRightSector) ||
          (isTopSector && isLeftSector) ||
          (isTopSector && isRightSector);

        const sectorSize: Vector3Array = [sectorWidth, 0.1, sectorHeight];
        const cornerSize: Vector3Array = [sectorHeight, 0.1, sectorHeight];
        const boxShape: Vector3Array = isCorner ? cornerSize : sectorSize;

        const bottomRotation: Vector3Array = [0, 0, 0];
        const topRotation: Vector3Array = [0, Math.PI, 0];
        const leftRotation: Vector3Array = [0, Math.PI / 2, 0];
        const rightRotation: Vector3Array = [0, -Math.PI / 2, 0];

        let rotation: Vector3Array = [0, 0, 0];
        let offsetX = 0;
        let offsetY = 0;

        if (isBottomSector) {
          rotation = bottomRotation;
          offsetY = -(sectorHeight - sectorWidth) / 2;
        }

        if (isLeftSector) {
          rotation = leftRotation;
          offsetX = -(sectorHeight - sectorWidth) / 2;
        }

        if (isRightSector) {
          rotation = rightRotation;
          offsetX = (sectorHeight - sectorWidth) / 2;
        }

        if (isTopSector) {
          rotation = topRotation;
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
          />
        );
      })}
    </group>
  );
}

export default GameBoard;
