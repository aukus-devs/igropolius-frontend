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
import usePlayerStore from '@/stores/playerStore';

type Props = {
  id: number;
  sector: SectorData;
  shape: Vector3Array;
  color?: ColorName;
  showColorGroup: boolean;
  isCorner: boolean;
};

const cornerTexture = `${import.meta.env.BASE_URL}assets/sectors/textures/corner.png`;

const sectorColors: { [k in ColorName]: string } = {
  blue: '#3B82F7',
  brown: '#A78F6D',
  green: '#68CE67',
  lightblue: '#81CFFA',
  orange: '#F2A33C',
  pink: '#EA3891',
  red: '#EB5545',
  yellow: '#F8D84A',
  pastelgreen: 'white',
};

function getSectorTexture(color?: ColorName) {
  return `${import.meta.env.BASE_URL}assets/sectors/textures/pastelgreen.png`;
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
    setPinPosition,
  } = useCanvasTooltipStore(
    useShallow(state => ({
      data: state.data,
      previousData: state.previousData,
      setData: state.setData,
      dismiss: state.dismiss,
      pin: state.pin,
      isPinned: state.isPinned,
      setPinPosition: state.setPinPosition,
    }))
  );
  const canSelectBuildingSector = usePlayerStore(state => state.canSelectBuildingSector);
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);
  const colorMeshRef = useRef<Mesh>(null);
  const texture = useTexture(isCorner ? cornerTexture : getSectorTexture(color));
  texture.flipY = false;
  const finalShape: Vector3Array = showColorGroup
    ? [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH - 2]
    : shape;
  const position: Vector3Array = showColorGroup
    ? [0, 0, SECTOR_DEPTH / 2 - finalShape[2] / 2]
    : [0, 0, 0];

  const tooltipWasOnCurrentSector =
    tooltipPrevData?.type === 'sector' && tooltipPrevData.payload.id === sector.id;

  const tooltipIsOnAnotherSector =
    tooltipData?.type === 'sector' && tooltipData?.payload.id !== sector.id;

  useEffect(() => {
    if (!isPinned && isHovered && tooltipWasOnCurrentSector) {
      setIsHovered(false);
    }
    if (isPinned && isHovered && tooltipIsOnAnotherSector) {
      setIsHovered(false);
    }
  }, [isPinned, isHovered, tooltipWasOnCurrentSector, tooltipIsOnAnotherSector]);

  useFrame(() => {
    const material = meshRef.current?.material as MeshStandardMaterial;
    if (material) {
      material.emissive.lerp(isHovered ? EMISSION_FULL : EMISSION_NONE, 0.1);
    }
    const material2 = colorMeshRef.current?.material as MeshStandardMaterial;
    if (material2) {
      material2.emissive.lerp(isHovered ? EMISSION_FULL : EMISSION_NONE, 0.1);
    }
  });

  function onPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    setData({ type: 'sector', payload: sector });
    setIsHovered(true);

    if (canSelectBuildingSector()) {
      document.body.style.cursor = 'pointer';
    }
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

  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (!canSelectBuildingSector()) return;

    if (isPinned) {
      setData({ type: 'sector', payload: sector }, true);
      setPinPosition(e.clientX, e.clientY);
    }
    pin();
    setIsHovered(true);
  }

  return (
    <group onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onClick={onClick}>
      <mesh ref={meshRef} position={position} receiveShadow>
        <boxGeometry args={finalShape} />
        <meshStandardMaterial
          color="white"
          roughness={0.75}
          map={texture}
          emissiveIntensity={0.25}
        />
      </mesh>
      {showColorGroup && (
        <mesh ref={colorMeshRef} position={[0, 0, -SECTOR_DEPTH / 2 + 1]}>
          <boxGeometry args={[SECTOR_WIDTH, SECTOR_HEIGHT, 2]} />
          <meshStandardMaterial
            color={color ? sectorColors[color] : 'white'}
            roughness={0.75}
            emissiveIntensity={0.25}
          />
        </mesh>
      )}
    </group>
  );
}

export default SectorBase;
