import { colors } from "@/types";
import { Gltf } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const smallBuildingUrl = `${import.meta.env.BASE_URL}assets/models/small_buildingD.glb`;
const largeBuildingUrl = `${import.meta.env.BASE_URL}assets/models/large_buildingC.glb`;
const biggestBuildingUrl = `${import.meta.env.BASE_URL}assets/models/skyscraperE.glb`;

type Props = {
  type?: "small" | "large" | "biggest";
  position: [number, number, number];
  scale?: number;
};

const wallMeshNames = [
  "Mesh_small_buildingD_1",
  "Mesh_large_buildingC_4",
  "Mesh_skyscraperE_3",
];

const buildingColors = {
  small: colors.brown,
  large: colors.green,
  biggest: colors.pink,
};

export default function Building({ position, type, scale }: Props) {
  const gltfRef = useRef(null);

  useEffect(() => {
    if (gltfRef.current) {
      // Traverse the model and adjust properties
      gltfRef.current.traverse((child) => {
        if (child.isMesh) {
          // console.log(child.name);
          const color = wallMeshNames.includes(child.name)
            ? buildingColors[type ?? "small"]
            : child.material.color;
          // Adjust the material to respond to lighting (e.g., MeshStandardMaterial)
          child.material = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: 0.5,
          });

          // Set cast and receive shadow properties
          // child.castShadow = true;
          // child.receiveShadow = true;
        }
      });
    }
  }, [gltfRef]);

  let modelUrl = smallBuildingUrl;
  if (type === "large") {
    modelUrl = largeBuildingUrl;
  } else if (type === "biggest") {
    modelUrl = biggestBuildingUrl;
  }

  return (
    <Gltf
      ref={gltfRef}
      src={modelUrl}
      position={position}
      scale={scale ?? 1}
      rotation={[0, THREE.MathUtils.degToRad(180), 0]}
    />
  );
}
