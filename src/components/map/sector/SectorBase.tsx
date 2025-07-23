import {
  SECTOR_WIDTH,
  SECTOR_HEIGHT,
  SECTOR_DEPTH,
  EMISSION_FULL,
  EMISSION_NONE,
} from '@/lib/constants';
import { ColorName, SectorData, Vector3Array } from '@/lib/types';
import { useTexture } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { useShallow } from 'zustand/shallow';

type Props = {
  id: number;
  sector: SectorData;
  shape: Vector3Array;
  color?: ColorName;
  showColorGroup: boolean;
  isCorner: boolean;
};

const cornerTexture = `${import.meta.env.BASE_URL}assets/sectors/textures/corner.png`;

function getSectorTexture(color?: ColorName) {
  switch (color) {
    case 'brown':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/brown.png`;
    case 'lightblue':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/lightblue.png`;
    case 'pink':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/pink.png`;
    case 'orange':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/orange.png`;
    case 'red':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/red.png`;
    case 'yellow':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/yellow.png`;
    case 'green':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/green.png`;
    case 'blue':
      return `${import.meta.env.BASE_URL}assets/sectors/textures/blue.png`;
    default:
      return `${import.meta.env.BASE_URL}assets/sectors/textures/pastelgreen.png`;
  }
}

function SectorBase({ sector, color, shape, showColorGroup, isCorner }: Props) {
  const {
    setData,
    dismiss,
    pin,
    isPinned,
    data: tooltipData,
    previousData: tooltipPrevData,
  } = useCanvasTooltipStore(
    useShallow(state => ({
      data: state.data,
      previousData: state.previousData,
      setData: state.setData,
      dismiss: state.dismiss,
      pin: state.pin,
      isPinned: state.isPinned,
    }))
  );
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
    document.body.style.cursor = 'pointer';
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    dismiss();

    const pinnedOnCurrentSector =
      isPinned && tooltipData?.type === 'sector' && tooltipData.payload.id === sector.id;

    if (!pinnedOnCurrentSector) {
      setIsHovered(false);
    }
    document.body.style.cursor = 'default';
  }

  const tooltipWasOnCurrentSector =
    tooltipPrevData?.type === 'sector' && tooltipPrevData.payload.id === sector.id;

  useEffect(() => {
    if (!isPinned && isHovered && tooltipWasOnCurrentSector) {
      setIsHovered(false);
    }
  }, [isPinned, isHovered, tooltipWasOnCurrentSector]);

  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    pin();
    setIsHovered(true);
  }

  return (
    <mesh
      ref={meshRef}
      position={position}
      receiveShadow
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <boxGeometry args={finalShape} />
      <meshStandardMaterial color="white" roughness={0.75} map={texture} emissiveIntensity={0.25} />
    </mesh>
  );
}

export default SectorBase;
