import {
  SECTOR_WIDTH,
  SECTOR_HEIGHT,
  SECTOR_DEPTH,
  EMISSION_FULL,
  EMISSION_NONE,
} from "@/lib/constants";
import { ColorName, SectorData, Vector3Array } from "@/lib/types";
import { useTexture } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import useCanvasTooltipStore from "@/stores/canvasTooltipStore";

type Props = {
  id: number;
  sector: SectorData;
  shape: Vector3Array;
  color: ColorName;
  showColorGroup: boolean;
  isCorner: boolean;
};

const cornerTexture = `${import.meta.env.BASE_URL}assets/sectors/textures/corner.png`;

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

function SectorBase({ sector, color, shape, showColorGroup, isCorner }: Props) {
  const setData = useCanvasTooltipStore((state) => state.setData);
  const dismiss = useCanvasTooltipStore((state) => state.dismiss);
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(isCorner ? cornerTexture : getSectorTexture(color));
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
    material.emissive.lerp(isHovered ? EMISSION_FULL : EMISSION_NONE, 0.1);
  });

  function onPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    setData({ type: 'sector', payload: sector });
    setIsHovered(true);
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    dismiss();
    setIsHovered(false);
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      receiveShadow
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <boxGeometry args={finalShape} />
      <meshStandardMaterial
        color="white"
        roughness={0.75}
        map={texture}
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

export default SectorBase;
