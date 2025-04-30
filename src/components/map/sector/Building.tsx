import { BUILDING_SCALE, SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { BuildingType, CellColor, Vector3Array } from "@/types";
import { Gltf } from "@react-three/drei";
import { eases } from "animejs";
import { animate } from "animejs";
import * as THREE from "three";

const buildingUrls: { [k in BuildingType]: string } = {
  ruins: `${STORAGE_BASE_URL}/models/buildings/ruins.glb`,
  "height-1": `${STORAGE_BASE_URL}/models/buildings/small_buildingD.glb`,
  "height-2": `${STORAGE_BASE_URL}/models/buildings/large_buildingC.glb`,
  "height-3": `${STORAGE_BASE_URL}/models/buildings/skyscraperE.glb`,
  "height-4": `${STORAGE_BASE_URL}/models/buildings/skyscraperA.glb`,
  "height-5": `${STORAGE_BASE_URL}/models/buildings/skyscraperF.glb`,
  "height-6": `${STORAGE_BASE_URL}/models/buildings/skyscraperD.glb`,
};

type Props = {
  type: BuildingType;
  position: Vector3Array;
  scale?: number;
  color: CellColor;
};

const meshesToColor = [
  "Mesh_small_buildingD_1", // wall
  "Mesh_small_buildingD_2", // roof/floor
  "Mesh_large_buildingC_4", // wall
  "Mesh_large_buildingC_2", // roof
  "Mesh_skyscraperE_3", // wall
  "Mesh_skyscraperE_5", // roof
  "Mesh_skyscraperA_1", // roof
  "Mesh_skyscraperA_2", // wall
  "Mesh_skyscraperA_4", // panels
  "Mesh_skyscraperF_3", // roof
  "Mesh_skyscraperF_2", // wall
  "Mesh_skyscraperD_2", // roof
  "Mesh_skyscraperD_4", // wall
  "Mesh_skyscraperD_1", // panels
];

function animateAppearance(model: THREE.Group) {
  model.position.y = -5.5;

  animate(model.position, {
    y: SECTOR_CONTENT_ELEVATION,
    ease: eases.inOutCubic,
    duration: 3000,
    // loop: true,
  });
}

function Building({ position, type, color }: Props) {
  const updateModel = (model: THREE.Group) => {
    if (model) {
      // Traverse the model and adjust properties
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mesh = child;
          const shouldRecolor = meshesToColor.includes(mesh.name);

          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Ensure each mesh has its own material instance
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((material) => {
              let mat = material;
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (shouldRecolor) {
                  mat = mat.clone();
                  mat.color.set(color);
                }
                // Update roughness and metalness
                mat.roughness = 0.75;
                mat.metalness = 0.25;
                mat.needsUpdate = true;
              }
              return mat;
            });
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            let mat = mesh.material;
            if (shouldRecolor) {
              mat = mat.clone();
              mat.color.set(color);
            }
            // Update roughness and metalness
            mat.roughness = 0.75;
            mat.metalness = 0.25;
            mat.needsUpdate = true;
            mesh.material = mat;
          }
        }
      });

      animateAppearance(model);
    }
  };

  const modelUrl = buildingUrls[type];

  return (
    <Gltf
      ref={updateModel}
      src={modelUrl}
      position={position}
      scale={BUILDING_SCALE}
      rotation={[0, Math.PI, 0]}
    />
  );
}

export default Building;
