import { Gltf, useTexture } from "@react-three/drei";
import { TrainData } from "@/types";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const RailUrl = `${import.meta.env.BASE_URL}assets/models/railroad-straight.glb`;
const TrainUrl = `${import.meta.env.BASE_URL}assets/models/train-electric-bullet-a.glb`;

const TextureUrl = `${import.meta.env.BASE_URL}assets/textures/train_colormap.png`;

type Props = {
  train: TrainData;
};

export default function TrainModel({ train }: Props) {
  const ref = useRef<THREE.Group>(null);
  const colorMap = useTexture(TextureUrl);

  useEffect(() => {
    if (!ref.current) return;
    colorMap.colorSpace = THREE.SRGBColorSpace;
    ref.current.traverse((child) => {
      // if (child.isMesh) {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        material.map = colorMap;
        material.needsUpdate = true;
      }
    });
  }, [colorMap]);

  return (
    <group>
      <Gltf
        ref={ref}
        src={TrainUrl}
        position={[0, 0, 7]}
        scale={1}
        rotation={[0, Math.PI / 5, 0]}
      />
    </group>
  );
}
