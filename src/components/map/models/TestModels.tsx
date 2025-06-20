import { SECTOR_CONTENT_ELEVATION, STORAGE_BASE_URL } from "@/lib/constants";
import { useGLTF } from "@react-three/drei";

const buildingUrls = [
  `${STORAGE_BASE_URL}/models/test-buildings/hugeA.glb`,
  `${STORAGE_BASE_URL}/models/test-buildings/hugeB.glb`,
  `${STORAGE_BASE_URL}/models/test-buildings/hugeC.glb`,
  `${STORAGE_BASE_URL}/models/test-buildings/large.glb`,
  `${STORAGE_BASE_URL}/models/test-buildings/medium.glb`,
  `${STORAGE_BASE_URL}/models/test-buildings/small.glb`,
];

function TestModels() {
  const models = useGLTF(buildingUrls);

  const gridModels = Array.from({ length: 16 }, () => {
    const randomIndex = Math.floor(Math.random() * buildingUrls.length);
    return models[randomIndex].scene.clone();
  });

  return (
    <group>
      {gridModels.map((model, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = col * 1.6;
        const z = row * 1.6;

        return (
          <primitive key={index} object={model} position={[x, SECTOR_CONTENT_ELEVATION, z]} />
        )
      })}
    </group>
  )
}

export default TestModels;
