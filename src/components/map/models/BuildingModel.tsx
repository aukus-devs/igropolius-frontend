import { BuildingData, Vector3Array } from "@/lib/types";
import { eases } from "animejs";
import { animate } from "animejs";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { InstanceProps, ThreeEvent } from "@react-three/fiber";
import useCanvasTooltipStore from "@/stores/canvasTooltipStore";
import { Outlines } from "@react-three/drei";

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
}

function animateAppearance(model: THREE.Group) {
  model.scale.set(1, 0.01, 1)

  animate(model.scale, {
    y: 1,
    ease: eases.inOutCubic,
    duration: 1500,
  });
}

function BuildingModel({ building, position, models }: Props) {
  const { type, owner } = building;
  const ColoredPart = models[`${type}`] as React.FC<PositionMeshProps>;
  const StaticPart = models[`${type}_1`] as React.FC<PositionMeshProps>;
  const OutlinePart = models[`${type}_outline`] as React.FC<PositionMeshProps>;

  const setData = useCanvasTooltipStore((state) => state.setData);
  const dismiss = useCanvasTooltipStore((state) => state.dismiss);
  const [isHovered, setIsHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    animateAppearance(groupRef.current);
  }, []);

  function onPointerEnter(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    setData({ type: 'building', payload: building });
    setIsHovered(true);
  }

  function onPointerLeave(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();

    dismiss();
    setIsHovered(false);
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, Math.PI, 0]}
    >
      <ColoredPart color={owner.color} />
      <StaticPart />
      <OutlinePart
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {isHovered && <Outlines thickness={5} color="white" />}
      </OutlinePart>
    </group>
  );
}

export default BuildingModel;
