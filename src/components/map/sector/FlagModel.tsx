import { STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

const FlagUrl = `${STORAGE_BASE_URL}/models/flags/flag-green.glb`;

export default function FlagModel() {
  return <Gltf src={FlagUrl} position={[4, 0, 4]} scale={5} rotation={[0, Math.PI, 0]} />;
}
