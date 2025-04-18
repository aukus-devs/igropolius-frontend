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
      <Gltf src={RailUrl} position={[0, 1, 6]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[2.5, 1, 8.5]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[5, 1, 11]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[7.5, 1, 13.5]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[10, 1, 16]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[12.5, 1, 18.5]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[15, 1, 21]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[17.5, 1, 23.5]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[20, 1, 26]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[22.5, 1, 28.5]} rotation={[0, Math.PI / 4, 0]} />
      <Gltf src={RailUrl} position={[25, 1, 31]} rotation={[0, Math.PI / 4, 0]} />,
      <Gltf
        ref={ref}
        src={TrainUrl}
        position={[1, 0, 7]}
        scale={1}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  );
}
