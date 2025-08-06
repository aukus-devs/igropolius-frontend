import { STORAGE_BASE_URL } from '@/lib/constants';
import { Gltf } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const CenterCompUrl = `${STORAGE_BASE_URL}/models/center/center_comp.glb`;
const mountainsUrl = `${STORAGE_BASE_URL}/models/center/mountains.glb`;

function CenterCompModel() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 1 + Math.sin(t * 3) * 10; // flicker
    }
  });

  return (
    <group position={[0, -1.4, 0]} rotation={[0, Math.PI, 0]}>
      <Gltf src={CenterCompUrl} />
      <Gltf src={mountainsUrl} position={[0, 0.56, 0]} />
      <pointLight ref={lightRef} position={[3, 14, 0]} color="red" intensity={10} />
    </group>
  );
}

export default CenterCompModel;
