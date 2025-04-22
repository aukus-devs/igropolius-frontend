import { SECTOR_CONTENT_ELEVATION } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const modelUrl = `${import.meta.env.BASE_URL}assets/models/buildings/bonus-wheel.glb`;

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
