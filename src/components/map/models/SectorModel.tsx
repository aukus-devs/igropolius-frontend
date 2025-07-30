import { EMISSION_FULL, EMISSION_NONE, STORAGE_BASE_URL } from "@/lib/constants";
import { ColorName } from "@/lib/types";
import { Gltf } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";

function getSectorModel(isCorner: boolean, color?: ColorName) {
	if (isCorner) return `${STORAGE_BASE_URL}/models/sectors/square_sector.glb`;

  switch (color) {
    case 'brown':
      return `${STORAGE_BASE_URL}/models/sectors/brown_sector.glb`;
    case 'lightblue':
      return `${STORAGE_BASE_URL}/models/sectors/lightblue_sector.glb`;
    case 'pink':
      return `${STORAGE_BASE_URL}/models/sectors/pink_sector.glb`;
    case 'orange':
      return `${STORAGE_BASE_URL}/models/sectors/orange_sector.glb`;
    case 'red':
      return `${STORAGE_BASE_URL}/models/sectors/red_sector.glb`;
    case 'yellow':
      return `${STORAGE_BASE_URL}/models/sectors/yellow_sector.glb`;
    case 'green':
      return `${STORAGE_BASE_URL}/models/sectors/green_sector.glb`;
    case 'blue':
      return `${STORAGE_BASE_URL}/models/sectors/blue_sector.glb`;
    default:
      return `${STORAGE_BASE_URL}/models/sectors/empty_sector.glb`;
  }
}

type Props = {
	color?: ColorName;
	isCorner: boolean;
  isHovered: boolean;
}

function SectorModel({color, isCorner, isHovered}: Props) {
  const gltfRef = useRef<Group>(null);

  useEffect(() => {
    if (!gltfRef.current) return;

    gltfRef.current.traverse((mesh) => {
      if (mesh instanceof Mesh) {
        mesh.material = mesh.material.clone();
        mesh.material.emissiveIntensity = 0.75;
        mesh.material.metalness = 0.05;
        mesh.material.roughness = 0.51;
      }
    });
  }, [color]);

  useFrame(() => {
    if (!gltfRef.current) return;

    gltfRef.current.traverse((mesh) => {
      if (mesh instanceof Mesh) {
        const material = mesh.material as MeshStandardMaterial;

        if (material) {
          material.emissive.lerp(isHovered ? EMISSION_FULL : EMISSION_NONE, 0.1);
        }
      }
    })
  });

  const model = useMemo(() => (
    <Gltf
      ref={gltfRef}
      src={getSectorModel(isCorner, color)}
      rotation={[0, Math.PI, 0]}
      scale={[1, 1, 1]}
      position={[0, -0.5, 0]}
    />
  ), [isCorner, color]);

	return model;
}

export default SectorModel;
