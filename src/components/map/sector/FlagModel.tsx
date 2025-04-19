import { Gltf, useTexture } from "@react-three/drei";
import * as THREE from "three";

const FlagUrl = `${import.meta.env.BASE_URL}assets/models/flag-green.glb`;
const TextureUrl = `${import.meta.env.BASE_URL}assets/textures/flag_colormap.png`;

export default function FlagModel() {
  const colorMap = useTexture(TextureUrl);

  const updateModel = (model: THREE.Group) => {
    if (!model) return;
    // colorMap.encoding = THREE.sRGBEncoding;
    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.flipY = false;
    model.traverse((child) => {
      // if (child.isMesh) {
      if (child instanceof THREE.Mesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;

        material.map = colorMap;
        material.needsUpdate = true;
      }
    });
  };
  return (
    <Gltf
      ref={updateModel}
      src={FlagUrl}
      position={[0, 0, 0]}
      scale={5}
      rotation={[0, Math.PI, 0]}
    />
  );
}
