import { CellColor, Vector3Array } from "@/types";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

const smallBuildingUrl = `${import.meta.env.BASE_URL}assets/models/small_buildingD.glb`;
const largeBuildingUrl = `${import.meta.env.BASE_URL}assets/models/large_buildingC.glb`;
const biggestBuildingUrl = `${import.meta.env.BASE_URL}assets/models/skyscraperE.glb`;

type Props = {
  type?: "small" | "large" | "biggest";
  position: Vector3Array;
  scale?: number;
  color: CellColor;
};

const wallMeshNames = [
  "Mesh_small_buildingD_1",
  "Mesh_large_buildingC_4",
  "Mesh_skyscraperE_3",
];

function Building({ position, type, scale, color }: Props) {
  // const gltfRef = useRef<null | THREE.Group>(null);

  const updateModel = (model: THREE.Group) => {
    if (model) {
      // Traverse the model and adjust properties
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;
          const isWallMesh = wallMeshNames.includes(mesh.name);

          // Ensure each mesh has its own material instance
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((material) => {
              let mat = material;
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (isWallMesh) {
                  mat = mat.clone();
                  mat.color.set(color);
                }
                // Update roughness and metalness
                mat.roughness = 0.5;
                mat.metalness = 0.5;
                mat.needsUpdate = true;
              }
              return mat;
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            let mat = mesh.material;
            if (isWallMesh) {
              mat = mat.clone();
              mat.color.set(color);
            }
            // Update roughness and metalness
            mat.roughness = 0.5;
            mat.metalness = 0.5;
            mat.needsUpdate = true;
            mesh.material = mat;
          }
        }
      });
    }
  };

  let modelUrl = smallBuildingUrl;
  if (type === "large") {
    modelUrl = largeBuildingUrl;
  } else if (type === "biggest") {
    modelUrl = biggestBuildingUrl;
  }

  return (
    <Gltf
      ref={updateModel}
      src={modelUrl}
      position={position}
      scale={scale ?? 1}
      rotation={[0, THREE.MathUtils.degToRad(180), 0]}
    />
  );
}

export default Building;
