import { SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${STORAGE_BASE_URL}/models/buildings/prison.glb`;

export default function PrisonModel() {
  return (
    <Gltf
      src={modelUrl}
      position={[SECTOR_DEPTH / 6, SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH / 6]}
      scale={[SECTOR_DEPTH / 2, 2, SECTOR_DEPTH / 2]}
    />
  );
}
