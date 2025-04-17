import { BUILDING_ELEVATION } from "@/lib/constants";
import { BuildingType, CellColor, Vector3Array } from "@/types";
import { Gltf } from "@react-three/drei";
import { eases } from "animejs";
import { animate } from "animejs";
import * as THREE from "three";

const buildingUrls: { [k in BuildingType]: string } = {
  ruins: `${import.meta.env.BASE_URL}assets/models/ruins.glb`,
  "height-1": `${import.meta.env.BASE_URL}assets/models/small_buildingD.glb`,
  "height-2": `${import.meta.env.BASE_URL}assets/models/large_buildingC.glb`,
  "height-3": `${import.meta.env.BASE_URL}assets/models/skyscraperE.glb`,
  "height-4": `${import.meta.env.BASE_URL}assets/models/skyscraperA.glb`,
  "height-5": `${import.meta.env.BASE_URL}assets/models/skyscraperF.glb`,
  "height-6": `${import.meta.env.BASE_URL}assets/models/skyscraperD.glb`,
};

type Props = {
  type: BuildingType;
  position: Vector3Array;
  scale?: number;
  color: CellColor;
};

const meshesToColor = [
  "Mesh_small_buildingD_1",
  "Mesh_large_buildingC_4",
  "Mesh_skyscraperE_3",
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
    y: BUILDING_ELEVATION,
    ease: eases.inOutCubic,
    duration: 3000,
    // loop: true,
  });
}

function Building({ position, type, scale = 1, color }: Props) {
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
                mat.roughness = 0.5;
                mat.metalness = 0.5;
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
            mat.roughness = 0.5;
            mat.metalness = 0.5;
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
      scale={scale}
      rotation={[0, Math.PI, 0]}
    />
  );
}

export default Building;
