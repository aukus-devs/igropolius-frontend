import { SectorData, Vector3Array } from "@/types";
import { Edges } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import Building from "./map/Building";

interface Props extends Omit<SectorData, "position"> {
  position: Vector3Array;
  rotation: Vector3Array;
  shape: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
  children?: React.ReactNode;
}

export function Sector({
  id,
  color,
  shape,
  position,
  rotation,
  onClick,
  onPointerOver,
  onPointerLeave,
  isSelected,
  children,
}: Props) {
  return (
    <group name={`${id}`} position={position} rotation={rotation}>
      <group name="players">{children}</group>
      <mesh
        onClick={(e) => (e.stopPropagation(), onClick?.(e))}
        onPointerOver={(e) => (e.stopPropagation(), onPointerOver?.(e))}
        onPointerLeave={onPointerLeave}
      >
        <boxGeometry args={shape} />
        <meshStandardMaterial color={color} emissive={isSelected ? "white" : 0} />
        <Edges scale={1.01} color="black" />
      </mesh>
      <group name="buildings">
        <Building type="small" position={[2, 0, 1.5]} />
        <Building type="large" position={[0.5, 0, 1.5]} />
        <Building type="biggest" position={[-1, 0, 1.5]} />
      </group>
    </group>
  );
}

export default Sector;
