import { BOARD_SIZE, SECTOR_HEIGHT } from "@/lib/constants";
import { colors } from "@/lib/types";
import TreeModel, { TreeType } from "./models/TreeModel";

type TreeParams = {
  treeType: TreeType;
  position: [number, number, number];
};

function Floor() {
  const trees: TreeParams[] = [
    { treeType: "tree_pine_a", position: [-3, 0.5, -BOARD_SIZE / 4] },
    { treeType: "tree_pine_b", position: [0, 0.5, -BOARD_SIZE / 4] },
    { treeType: "tree_pine_c", position: [3, 0.5, -BOARD_SIZE / 4] },
    { treeType: "tree_pine_d", position: [6, 0.5, -BOARD_SIZE / 4] },
    { treeType: "tree_spherical_a", position: [-6, 0.5, -BOARD_SIZE / 6] },
    { treeType: "tree_spherical_b", position: [-3, 0.5, -BOARD_SIZE / 6] },
    { treeType: "tree_spherical_c", position: [0, 0.5, -BOARD_SIZE / 6] },
    { treeType: "tree_spherical_d", position: [3, 0.5, -BOARD_SIZE / 6] },
    { treeType: "tree_spherical_e", position: [6, 0.5, -BOARD_SIZE / 6] },
    { treeType: "tree_spherical_f", position: [9, 0.5, -BOARD_SIZE / 6] },
  ];
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[BOARD_SIZE, SECTOR_HEIGHT, BOARD_SIZE]} />
        <meshStandardMaterial color={colors.pastelgreen} roughness={0.75} />
      </mesh>
      {trees.map((tree, index) => (
        <TreeModel key={index} treeType={tree.treeType} position={tree.position} />
      ))}
    </group>
  );
}

export default Floor;
