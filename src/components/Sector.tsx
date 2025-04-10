import { FLOOR_SIZE, SECTOR_ELEVATION } from "@/lib/constants";
import { ISector } from "@/lib/interfaces";
import { ThreeEvent } from "@react-three/fiber";

interface Props extends ISector {
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
}

export function Sector({ color = "#fff", position, onClick, onPointerOver, onPointerLeave }: Props) {
  return (
    <group position={[
      position.x - FLOOR_SIZE / 4,
      SECTOR_ELEVATION,
      position.y - FLOOR_SIZE / 4,
    ]}>
      <mesh onClick={onClick} onPointerOver={onPointerOver} onPointerLeave={onPointerLeave}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default Sector;
