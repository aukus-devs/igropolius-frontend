import { BuildingData, BuildingType, Vector3Array } from '@/lib/types';
import { eases } from 'animejs';
import { animate } from 'animejs';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { InstanceProps, ThreeEvent } from '@react-three/fiber';
import useCanvasTooltipStore from '@/stores/canvasTooltipStore';
import { Outlines, Sparkles } from '@react-three/drei';
import usePlayerStore from '@/stores/playerStore';
import { useIsMobile } from '@/hooks/use-mobile';

type Props = {
  building: BuildingData;
  position: Vector3Array;
  models: React.FC<InstanceProps> & Record<string, React.FC<InstanceProps>>;
};

type PositionMeshProps = InstanceProps & {
  color?: string;
  position?: Vector3Array;
  rotation?: Vector3Array;
  children?: React.ReactNode;
  onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

async function animateAppearance(model: THREE.Group) {
  model.scale.set(1, 0.01, 1);

  return new Promise<void>(resolve => {
    animate(model.scale, {
      y: 1,
      ease: eases.inOutCubic,
      duration: 1500,
      onComplete: () => {
        resolve();
      },
    });
  });
}

const buildingToScale: Record<BuildingType, Vector3Array> = {
  "ruins": [1.25, 1, 1.25],
  "small_buildingD": [1.25, 1.5, 1.25],
  "skyscraperE": [1.75, 3, 1.75],
  "skyscraperA": [1.75, 3.1, 1.75],
  "skyscraperB": [1.75, 4.25, 1.75],
  "skyscraperD": [1.75, 5.5, 1.75],
  "skyscraperX": [1.75, 7, 1.75],
}

const buildingToSparklesCount: Record<BuildingType, number> = {
  "ruins": 10,
  "small_buildingD": 20,
  "skyscraperE": 40,
  "skyscraperA": 50,
  "skyscraperB": 60,
  "skyscraperD": 70,
  "skyscraperX": 100,
}

function BuildingModel({ building, position, models }: Props) {
  const { type, owner, hasGroupBonus } = building;
  const ColoredPart = models[`${type}`] as React.FC<PositionMeshProps>;
  const StaticPart = models[`${type}_1`] as React.FC<PositionMeshProps>;
  const OutlinePart = models[`${type}_outline`] as React.FC<PositionMeshProps>;

  const isMobile = useIsMobile();
  const setData = useCanvasTooltipStore(state => state.setData);
  const dismiss = useCanvasTooltipStore(state => state.dismiss);
  const tooltipData = useCanvasTooltipStore(state => state.data);
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  const isNewBuilding = usePlayerStore(state => {
    return state.newBuildingsIds.includes(building.id);
  });

  useEffect(() => {
    if (!groupRef.current) return;
    if (!isNewBuilding) return;

    animateAppearance(groupRef.current);
  }, [isNewBuilding]);

  useEffect(() => {
    if (isMobile && isHovered) {
      if (
        !tooltipData ||
        tooltipData.type !== 'building' ||
        tooltipData.payload?.id !== building.id
      ) {
        setIsHovered(false);
      }
    }
  }, [isMobile, tooltipData, isHovered, building.id]);

  function onPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    if (isMobile) return;

    setData({ type: 'building', payload: building });
    setIsHovered(true);
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    if (isMobile) return;

    dismiss();
    setIsHovered(false);
  }

  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (isMobile) {
      setData({ type: 'building', payload: building });
      setIsHovered(true);
    }
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, type === 'ruins' ? Math.PI : 0, 0]}>
      <ColoredPart color={owner.color} />
      <OutlinePart
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClick={onClick}
      >
        {isHovered && <Outlines thickness={5} color="white" />}
      </OutlinePart>

      {hasGroupBonus ? (
        <Sparkles
          position={[0, buildingToScale[type][1] / 2, 0]}
          count={buildingToSparklesCount[type]}
          scale={buildingToScale[type]}
          size={24}
          speed={1}
        />
      ) : (
        <StaticPart />
      )}
    </group>
  );
}

export default BuildingModel;
