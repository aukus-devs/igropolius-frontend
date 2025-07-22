import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const url = `${STORAGE_BASE_URL}/models/buildings/parking.glb`;

function ParkingModel() {
	return <Gltf src={url} position={[0, SECTOR_CONTENT_ELEVATION, 0]} />;
}

export default ParkingModel;

