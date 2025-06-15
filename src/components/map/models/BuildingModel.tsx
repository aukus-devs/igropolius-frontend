import { BUILDING_SCALE, EMISSION_FULL, EMISSION_NONE, STORAGE_BASE_URL } from "@/lib/constants";
import { BuildingData, BuildingType, Vector3Array } from "@/lib/types";
import { Gltf } from "@react-three/drei";
import { eases } from "animejs";
import { animate } from "animejs";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import useCanvasTooltipStore from "@/stores/canvasTooltipStore";

const buildingUrls: { [k in BuildingType]: string } = {
  ruins: `${STORAGE_BASE_URL}/models/buildings/ruins.glb`,
  "height-1": `${STORAGE_BASE_URL}/models/buildings/small_buildingD.glb`,
  "height-2": `${STORAGE_BASE_URL}/models/buildings/large_buildingC.glb`,
  "height-3": `${STORAGE_BASE_URL}/models/buildings/skyscraperE.glb`,
  "height-4": `${STORAGE_BASE_URL}/models/buildings/skyscraperA.glb`,
  "height-5": `${STORAGE_BASE_URL}/models/buildings/skyscraperF.glb`,
  "height-6": `${STORAGE_BASE_URL}/models/buildings/skyscraperD.glb`,
};

const meshesToColor = [
  "Mesh_small_buildingD_1", // wall
  "Mesh_small_buildingD_2", // roof/floor
  "Mesh_large_buildingC_4", // wall
  "Mesh_large_buildingC_2", // roof
  "Mesh_skyscraperE_3", // wall
  "Mesh_skyscraperE_5", // roof
  "Mesh_skyscraperA_1", // roof
  "Mesh_skyscraperA_2", // wall
  "Mesh_skyscraperA_4", // panels
  "Mesh_skyscraperF_3", // roof
  "Mesh_skyscraperF_2", // wall
  "Mesh_skyscraperD_2", // roof
  "Mesh_skyscraperD_4", // wall
  "Mesh_skyscraperD_1", // panels
];

type Props = {
  building: BuildingData;
  position: Vector3Array;
};

function animateAppearance(model: THREE.Group) {
  model.scale.set(1, 0.01, 1)

  animate(model.scale, {
    y: 1,
    ease: eases.inOutCubic,
    duration: 1500,
  });
}

function Building({ building, position }: Props) {
  const { type, owner } = building;

  const setData = useCanvasTooltipStore((state) => state.setData);
  const dismiss = useCanvasTooltipStore((state) => state.dismiss);
  const [isHovered, setIsHovered] = useState(false);
  const gltfRef = useRef<THREE.Group>(null);
  const modelUrl = buildingUrls[type];

  useEffect(() => {
    if (!gltfRef.current) return;

    gltfRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const shouldRecolor = meshesToColor.includes(child.name);
        const material = child.material.clone() as THREE.MeshStandardMaterial;

        material.roughness = 0.75;
        material.metalness = 0.25;
        material.emissiveIntensity = 0.25;
        if (shouldRecolor) material.color.set(owner.color);

        child.castShadow = true;
        child.receiveShadow = true;
        child.material = material;
      }
    });

    animateAppearance(gltfRef.current);
  }, [owner.color]);

  useFrame(() => {
    if (!gltfRef.current) return;

    gltfRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material;
        material.emissive.lerp(isHovered ? EMISSION_FULL : EMISSION_NONE, 0.1);
      }
    })
  })

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
    <group position={position}>
      <Gltf
        ref={gltfRef}
        src={modelUrl}
        scale={BUILDING_SCALE}
        rotation={[0, Math.PI, 0]}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    </group>
  );
}

export default Building;
