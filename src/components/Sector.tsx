import { SectorData, Vector3Array } from "@/types";
import { Edges } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import Building from "./map/Building";
import { useMemo } from "react";

type Props = {
  sector: SectorData;
  position: Vector3Array;
  rotation: Vector3Array;
  shape: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
};

export function Sector({
  sector,
  shape,
  position,
  rotation,
  onClick,
  onPointerOver,
  onPointerLeave,
  isSelected,
}: Props) {
  const canHaveBuildings = sector.type === "property";

  // Temporary fix f unnecessary re-renders
  const buildings = useMemo(() => {
    if (!canHaveBuildings) return null;

    return (
      <group name="buildings">
        <Building type="small" position={[2, 0, 1.5]} />
        <Building type="large" position={[0.5, 0, 1.5]} />
        <Building type="biggest" position={[-1, 0, 1.5]} />
      </group>
    )
  }, [canHaveBuildings]);

  return (
    <group name={`${sector.id}`} position={position} rotation={rotation}>
      <mesh
        onClick={(e) => (e.stopPropagation(), onClick?.(e))}
        onPointerOver={(e) => (e.stopPropagation(), onPointerOver?.(e))}
        onPointerLeave={onPointerLeave}
      >
        <boxGeometry args={shape} />
        <meshStandardMaterial color={sector.color} emissive={isSelected ? "white" : 0} />
        <Edges scale={1.01} color="black" />
      </mesh>
      {buildings}
    </group>
  );
}

export default Sector;
