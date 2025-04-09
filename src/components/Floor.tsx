import { FLOOR_HEIGHT, FLOOR_SIZE } from "@/lib/constants";

export function Floor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <boxGeometry args={[FLOOR_SIZE, FLOOR_SIZE, FLOOR_HEIGHT]} />
      <meshStandardMaterial color="#0a0a0a" />
    </mesh>
  )
}

export default Floor;
