import { BOARD_SIZE, SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

const url = `${STORAGE_BASE_URL}/models/colors_test.glb`;

function TestSectors() {
	return <Gltf src={url} position={[-BOARD_SIZE, SECTOR_CONTENT_ELEVATION, -BOARD_SIZE - 20]} rotation={[0, Math.PI, 0]} />;
}

export default TestSectors;
