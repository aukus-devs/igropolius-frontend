import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${STORAGE_BASE_URL}/models/buildings/prison.glb`;

export default function PrisonModel() {
  return (
    <Gltf
      src={modelUrl}
      position={[0, SECTOR_CONTENT_ELEVATION, 0]}
      scale={[0.75, 1, 0.75]}
    />
  );
}
