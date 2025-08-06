import { STORAGE_BASE_URL } from '@/lib/constants';
import { Gltf } from '@react-three/drei';
import { BlinkingLight } from './BlinkingLight';

const CenterCompUrl = `${STORAGE_BASE_URL}/models/center/center_comp.glb`;
const mountainsUrl = `${STORAGE_BASE_URL}/models/center/mountains.glb`;

function CenterCompModel() {
  return (
    <group position={[0, -1.4, 0]} rotation={[0, Math.PI, 0]}>
      <Gltf src={CenterCompUrl} />
      <Gltf src={mountainsUrl} position={[0, 0.56, 0]} />
      <BlinkingLight position={[3, 14, 0]} color="red" onDuration={1} offDuration={1} />
    </group>
  );
}

export default CenterCompModel;
