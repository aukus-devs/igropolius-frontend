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
    <group name="train" rotation={[0, Math.PI / 3.9, 0]} position={[2, 0, 7]}>
      <Gltf src={RailUrl} position={[0, 1, 0]} />
      <Gltf src={RailUrl} position={[0, 1, 4]} />
      <Gltf src={RailUrl} position={[0, 1, 8]} />
      <Gltf src={RailUrl} position={[0, 1, 12]} />
      <Gltf src={RailUrl} position={[0, 1, 16]} />
      <Gltf src={RailUrl} position={[0, 1, 20]} />
      <Gltf src={RailUrl} position={[0, 1, 24]} />
      <Gltf src={RailUrl} position={[0, 1, 28]} />
      <Gltf src={RailUrl} position={[0, 1, 32]} />
      <Gltf ref={ref} src={TrainUrl} position={[0, 0, 0]} scale={1} />
    </group>
  );
}
