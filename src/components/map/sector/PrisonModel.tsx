import { SECTOR_CONTENT_ELEVATION } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${import.meta.env.BASE_URL}assets/models/prison.glb`;

export default function PrisonModel() {
  return <Gltf src={modelUrl} position={[0, SECTOR_CONTENT_ELEVATION, 0]} scale={[6, 3, 6]} />;
}
