import {
  SECTOR_WIDTH,
  SECTOR_HEIGHT,
  SECTOR_DEPTH,
  EMISSION_FULL,
  EMISSION_NONE,
} from "@/lib/constants";
import useSectorStore from "@/stores/sectorStore";
import { ColorName, Vector3Array } from "@/lib/types";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";

type Props = {
  id: number;
  shape: Vector3Array;
  color: ColorName;
  showColorGroup: boolean;
};

function getSectorTexture(color: ColorName) {
  switch (color) {
    case "brown":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/brown.png`;
    case "lightblue":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/lightblue.png`;
    case "pink":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/pink.png`;
    case "orange":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/orange.png`;
    case "red":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/red.png`;
    case "yellow":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/yellow.png`;
    case "green":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/green.png`;
    case "blue":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/blue.png`;
    case "pastelgreen":
      return `${import.meta.env.BASE_URL}assets/sectors/textures/pastelgreen.png`;
  }
}

function SectorBase({ id, color, shape, showColorGroup }: Props) {
  const setSelectedSectorId = useSectorStore((state) => state.setSelectedSectorId);
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(getSectorTexture(color));
  texture.flipY = false;
  const finalShape: Vector3Array = showColorGroup
    ? [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH]
    : shape;
  const position: Vector3Array = showColorGroup
    ? [0, 0, SECTOR_DEPTH / 2 - finalShape[2] / 2]
    : [0, 0, 0];

  useFrame(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as MeshStandardMaterial;
    material.emissive.lerp(isSelected ? EMISSION_FULL : EMISSION_NONE, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      receiveShadow
      onPointerEnter={(e) => (e.stopPropagation(), setSelectedSectorId(id))}
      onPointerLeave={(e) => (e.stopPropagation(), setSelectedSectorId(null))}
    >
      <boxGeometry args={finalShape} />
      <meshStandardMaterial color="white" roughness={0.75} map={texture} emissiveIntensity={0.25} />
    </mesh>
  );
}

export default SectorBase;
