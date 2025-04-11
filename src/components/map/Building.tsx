import { colors } from "@/types";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

const smallBuildingUrl = `${import.meta.env.BASE_URL}assets/models/small_buildingD.glb`;
const largeBuildingUrl = `${import.meta.env.BASE_URL}assets/models/large_buildingC.glb`;
const biggestBuildingUrl = `${import.meta.env.BASE_URL}assets/models/skyscraperE.glb`;

type Props = {
  type?: "small" | "large" | "biggest";
  position: [number, number, number];
  scale?: number;
};

const wallMeshNames = [
  "Mesh_small_buildingD_1",
  "Mesh_large_buildingC_4",
  "Mesh_skyscraperE_3",
];

const buildingColors = {
  small: colors.brown,
  large: colors.green,
  biggest: colors.pink,
};

export default function Building({ position, type, scale }: Props) {
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
              if (material instanceof THREE.MeshStandardMaterial) {
                // Update roughness and metalness
                material.roughness = 0.5;
                material.metalness = 0.5;
                // Set color for specific meshes
                if (isWallMesh) {
                  material.color.set(buildingColors[type ?? "small"]); // Use appropriate type
                }
                material.needsUpdate = true;
              }
              return material;
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            // Update roughness and metalness
            mesh.material.roughness = 0.5;
            mesh.material.metalness = 0.5;
            // Set color for specific meshes
            if (isWallMesh) {
              mesh.material.color.set(buildingColors[type ?? "small"]); // Use appropriate type
            }
            mesh.material.needsUpdate = true;
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
