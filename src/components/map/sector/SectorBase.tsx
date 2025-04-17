import { SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH, EMISSION_FULL, EMISSION_NONE } from "@/lib/constants";
import useSectorStore from "@/stores/sectorStore";
import { Vector3Array, colors } from "@/types";
import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Mesh, Color, MeshStandardMaterial } from "three";

type Props = {
  id: number;
  shape: Vector3Array;
  color: string;
  canHaveBuildings: boolean;
}

function SectorColoredPlatform({ color }: { color: string }) {
  const shape: Vector3Array = [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH / 100 * 15];
  const position: Vector3Array = [0, 0, -SECTOR_DEPTH / 2 + shape[2] / 2];

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={shape} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.25} />
      <Edges scale={1} lineWidth={3} color="black" />
    </mesh>
  );
}

function SectorMainPlatform({ id, shape, canHaveBuildings }: Omit<Props, 'color'>) {
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);
  const meshRef = useRef<Mesh>(null);

  const platform = useMemo(() => {
    const color = new Color(colors.pastelgreen);
    const finalShape: Vector3Array = canHaveBuildings
      ? [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH / 100 * 85]
      : shape;
    const position: Vector3Array = canHaveBuildings
      ? [0, 0, SECTOR_DEPTH / 2 - finalShape[2] / 2]
      : [0, 0, 0];

    return (
      <mesh ref={meshRef} position={position} receiveShadow>
        <boxGeometry args={finalShape} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.25} />
        <Edges scale={1} lineWidth={3} color="black" />
      </mesh>
    )
  }, [canHaveBuildings, shape]);

  useFrame(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as MeshStandardMaterial;
    material.emissive.lerp(isSelected ? EMISSION_FULL : EMISSION_NONE, 0.1);
  });

  return (
    <>
      {platform}
    </>
  )
}

function SectorBase({ id, color, shape, canHaveBuildings }: Props) {
  const setSelectedSectorId = useSectorStore((state) => state.setSelectedSectorId);

  return (
    <group
      onPointerEnter={(e) => (e.stopPropagation(), setSelectedSectorId(id))}
      onPointerLeave={(e) => (e.stopPropagation(), setSelectedSectorId(null))}
    >
      <SectorMainPlatform id={id} shape={shape} canHaveBuildings={canHaveBuildings} />
      {canHaveBuildings && <SectorColoredPlatform color={color} />}
    </group>
  )
}

export default SectorBase;
