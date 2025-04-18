import { Gltf } from "@react-three/drei";

const modelUrl = `${import.meta.env.BASE_URL}assets/models/prison.glb`;

export default function PrisonModel() {
  return <Gltf src={modelUrl} position={[0, 0, 0]} scale={[6, 3, 6]} />;
}
