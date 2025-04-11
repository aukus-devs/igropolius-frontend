import { CELL_SIDE_SIZE_MULTIPLIER, SECTOR_ELEVATION } from "@/lib/constants";
import { IEntity } from "@/lib/interfaces";
import { SectorData } from "@/types";
import { Edges } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";

interface Props extends IEntity {
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
  isSelected?: boolean;
}

type CellSize = [number, number, number];

export function Sector({
  id,
  color,
  position,
  onClick,
  onPointerOver,
  onPointerLeave,
  isSelected,
}: SectorData & Props) {
  const isBottomSector = position.y === 0;
  const isLeftSector = position.x === 0;
  const isRightSector = position.x === 10;
  const isTopSector = position.y === 10;

  const isCorner =
    (isBottomSector && isLeftSector) ||
    (isBottomSector && isRightSector) ||
    (isTopSector && isLeftSector) ||
    (isTopSector && isRightSector);

  const bottomSize: CellSize = [CELL_SIDE_SIZE_MULTIPLIER, 0.1, 2];
  const topSize: CellSize = [CELL_SIDE_SIZE_MULTIPLIER, 0.1, 2];
  const leftSize: CellSize = [2, 0.1, CELL_SIDE_SIZE_MULTIPLIER];
  const rightSize: CellSize = [2, 0.1, CELL_SIDE_SIZE_MULTIPLIER];

  const cornerSize: CellSize = [CELL_SIDE_SIZE_MULTIPLIER, 0.1, CELL_SIDE_SIZE_MULTIPLIER];

  let size: CellSize = cornerSize;
  if (isBottomSector) {
    size = bottomSize;
  } else if (isLeftSector) {
    size = leftSize;
  } else if (isRightSector) {
    size = rightSize;
  } else if (isTopSector) {
    size = topSize;
  }
  if (isCorner) {
    size = cornerSize;
  }

  const sideSize = CELL_SIDE_SIZE_MULTIPLIER * 10;
  const sideDistanceToCenter = sideSize / 2;

  return (
    <group
      name={id}
      position={[
        position.x * CELL_SIDE_SIZE_MULTIPLIER - sideDistanceToCenter,
        SECTOR_ELEVATION,
        position.y * CELL_SIDE_SIZE_MULTIPLIER - sideDistanceToCenter,
      ]}
    >
      <mesh onClick={onClick} onPointerOver={onPointerOver} onPointerLeave={onPointerLeave}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} emissive={isSelected ? 'white' : 0} />
        <Edges scale={1.01} color="black" />
      </mesh>
    </group>
  );
}

export default Sector;
