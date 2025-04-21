import { SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${import.meta.env.BASE_URL}assets/models/prison.glb`;

export default function PrisonModel() {
  return (
    <Gltf
      src={modelUrl}
      position={[SECTOR_DEPTH / 6, SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH / 6]}
      scale={[SECTOR_DEPTH / 2, 2, SECTOR_DEPTH / 2]}
    />
  );
}
