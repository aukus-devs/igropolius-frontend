import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const FlagUrl = `${STORAGE_BASE_URL}/models/buildings/start.glb`;

function StartModel() {
  return <Gltf src={FlagUrl} position={[0, SECTOR_CONTENT_ELEVATION, 0]} rotation={[0, Math.PI, 0]} />;
}

export default StartModel;

