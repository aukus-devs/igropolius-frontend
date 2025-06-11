import { SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${STORAGE_BASE_URL}/models/buildings/prison.glb`;

export default function PrisonModel() {
  return (
    <Gltf
      src={modelUrl}
      position={[0, SECTOR_CONTENT_ELEVATION, 0]}
      scale={[SECTOR_DEPTH / 1.5, 2, SECTOR_DEPTH / 1.5]}
    />
  );
}
