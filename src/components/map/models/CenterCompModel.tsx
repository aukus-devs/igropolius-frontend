import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const CenterCompUrl = `${STORAGE_BASE_URL}/models/center/center_comp.glb`;

function CenterCompModel() {
  return <Gltf src={CenterCompUrl} position={[0, SECTOR_CONTENT_ELEVATION, 0]} rotation={[0, Math.PI, 0]} />;
}

export default CenterCompModel;
