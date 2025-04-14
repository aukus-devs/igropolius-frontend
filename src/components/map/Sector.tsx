import { SectorData, Vector3Array, colors } from "@/types";
import { Edges, Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import Building from "./Building";
import { Group } from "three";
import useAppStore from "@/stores/appStore";

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
  const addSectorModel = useAppStore((state) => state.addSectorModel);
  const sectorRef = useRef<Group | null>(null);
  const canHaveBuildings = sector.type === "property";

  // Temporary performance fix from unnecessary re-renders
  const buildings = useMemo(() => {
    if (!canHaveBuildings) return null;

    return (
      <group name="buildings">
        <Building type="small" position={[2, 0, 5]} color={colors.blue} />
        <Building type="large" position={[0.5, 0, 5]} color={colors.red} />
        <Building type="biggest" position={[-1, 0, 5]} color={colors.brown} />
        <Building type="large" position={[2, 0, 3.5]} color={colors.green} />
        <Building type="biggest" position={[0.5, 0, 3.5]} color={colors.yellow} />
        <Building type="small" position={[-1, 0, 3.5]} color={colors.pink} />
        <Building type="biggest" position={[2, 0, 2]} color={colors.orange} />
        <Building type="small" position={[0.5, 0, 2]} color={colors.lightblue} />
        <Building type="large" position={[-1, 0, 2]} color={colors.biege} />
      </group>
    );
  }, [canHaveBuildings]);

  const textId = useMemo(() => {
    const isCorner = sector.type === "corner";
    const textPosition: Vector3Array = isCorner ? [-5, 0.2, -5] : [0, 0.2, -5];
    const textRotation: Vector3Array = isCorner
      ? [Math.PI / 2, Math.PI, Math.PI / 4]
      : [Math.PI / 2, Math.PI, 0];

    return (
      <Text position={textPosition} rotation={textRotation} fontSize={1} color="black">
        {sector.id}
      </Text>
    );
  }, [sector.id, sector.type]);

  useEffect(() => {
    if (sectorRef.current) {
      console.log('???')
      addSectorModel(sectorRef.current);
    }
  }, [sectorRef, addSectorModel])

  return (
    <group ref={sectorRef} name={`sector_${sector.id}`} position={position} rotation={rotation}>
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
      {textId}
    </group>
  );
}

export default Sector;
