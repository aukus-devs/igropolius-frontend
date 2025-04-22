import { Gltf } from "@react-three/drei";
import { TrainData } from "@/types";

import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";

const RailUrl = `${STORAGE_BASE_URL}/models/trains/railroad-straight.glb`;
const TrainUrl = `${STORAGE_BASE_URL}/models/trains/train-electric-bullet-a.glb`;

type Props = {
  train: TrainData;
};

export default function TrainModel({ train }: Props) {
  // use train data for animation
  return (
    <group
      name="train"
      rotation={[0, Math.PI / 3.9, 0]}
      position={[2, SECTOR_CONTENT_ELEVATION, 7]}
    >
      <Gltf src={RailUrl} position={[0, 1, 0]} />
      <Gltf src={RailUrl} position={[0, 1, 4]} />
      <Gltf src={RailUrl} position={[0, 1, 8]} />
      <Gltf src={RailUrl} position={[0, 1, 12]} />
      <Gltf src={RailUrl} position={[0, 1, 16]} />
      <Gltf src={RailUrl} position={[0, 1, 20]} />
      <Gltf src={RailUrl} position={[0, 1, 24]} />
      <Gltf src={RailUrl} position={[0, 1, 28]} />
      <Gltf src={RailUrl} position={[0, 1, 32]} />
      <Gltf src={TrainUrl} />
    </group>
  );
}
