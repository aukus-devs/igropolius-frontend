import { playersData, sectorsData } from "@/lib/mockData";
import Sector from "./Sector";
import { FLOOR_SIZE, PLAYER_ELEVATION, SECTOR_DEPTH, SECTOR_ELEVATION, SECTOR_WIDTH } from "@/lib/constants";
import { Vector3Array } from "@/types";
import PlayerModel from "./PlayerModel";
import useAppStore from "@/stores/appStore";

interface Props {
  scale?: number;
}

function GameBoard({ scale = 1 }: Props) {
  const selectedSector = useAppStore((state) => state.selectedSector);
  const setSelectedSectorId = useAppStore((state) => state.setSelectedSectorId);
  const sectorsPerSide = 12;
  const centerPosition = (FLOOR_SIZE / sectorsPerSide) * SECTOR_WIDTH;

  return (
    <group
      position={[-centerPosition, SECTOR_ELEVATION, -centerPosition]}
      scale={[scale, 1, scale]}
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
        const isLeftSector = sector.position.x === 0;
        const isRightSector = sector.position.x === 10;
        const isTopSector = sector.position.y === 10;

        const isCorner =
          (isBottomSector && isLeftSector) ||
          (isBottomSector && isRightSector) ||
          (isTopSector && isLeftSector) ||
          (isTopSector && isRightSector);

        const sectorSize: Vector3Array = [SECTOR_WIDTH, 0.1, SECTOR_DEPTH];
        const cornerSize: Vector3Array = [SECTOR_DEPTH, 0.1, SECTOR_DEPTH];
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
          offsetY = -(SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isLeftSector) {
          rotation = leftRotation;
          offsetX = -(SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isRightSector) {
          rotation = rightRotation;
          offsetX = (SECTOR_DEPTH - SECTOR_WIDTH) / 2;
        }

        if (isTopSector) {
          rotation = topRotation;
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
