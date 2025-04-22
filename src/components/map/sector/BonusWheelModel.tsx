import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${STORAGE_BASE_URL}/models/buildings/bonus-wheel.glb`;

export default function BonusWheelModel() {
  return (
    <>
      <Gltf
        src={modelUrl}
        position={[0, SECTOR_CONTENT_ELEVATION, 4]}
        rotation={[0, 0, 0]}
        scale={0.4}
      />
      ;
      <Gltf
        src={modelUrl}
        position={[0, SECTOR_CONTENT_ELEVATION, 4]}
        rotation={[0, Math.PI, 0]}
        scale={0.4}
      />
      ;
    </>
  );
}
