import { FLOOR_HEIGHT, FLOOR_SIZE } from "@/lib/constants";

export function Floor() {
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[FLOOR_SIZE, FLOOR_HEIGHT, FLOOR_SIZE]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  );
}

export default Floor;
