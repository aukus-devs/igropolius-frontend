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

export default function Building({ position, type, scale }: Props) {
  const gltfRef = useRef(null);

  useEffect(() => {
    if (gltfRef.current) {
      // Traverse the model and adjust properties
      gltfRef.current.traverse((child) => {
        if (child.isMesh) {
          // Adjust the material to respond to lighting (e.g., MeshStandardMaterial)
          child.material = new THREE.MeshStandardMaterial({
            color: child.material.color,
            roughness: 0.5,
            metalness: 0.5,
          });

          // Set cast and receive shadow properties
          child.castShadow = true;
          child.receiveShadow = true;
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

  return <Gltf ref={gltfRef} src={modelUrl} position={position} scale={scale ?? 1} />;
}
