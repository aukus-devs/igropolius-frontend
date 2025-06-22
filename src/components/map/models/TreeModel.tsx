import { STORAGE_BASE_URL } from "@/lib/constants";
import { Gltf } from "@react-three/drei";

export type TreeType =
  | "tree_pine_a"
  | "tree_pine_b"
  | "tree_pine_c"
  | "tree_pine_d"
  | "tree_spherical_a"
  | "tree_spherical_b"
  | "tree_spherical_c"
  | "tree_spherical_d"
  | "tree_spherical_e"
  | "tree_spherical_f";

type Props = {
  treeType: TreeType;
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
};

export default function TreeModel(props: Props) {
  const scale = props.scale || 1;
  const rotation = props.rotation || [0, 0, 0];
  const url = `${STORAGE_BASE_URL}/models/trees/${props.treeType}.glb`;

  return <Gltf src={url} position={props.position} scale={scale} rotation={rotation} />;
}
