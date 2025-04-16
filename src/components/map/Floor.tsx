import { FLOOR_HEIGHT, FLOOR_SIZE } from "@/lib/constants";
import { colors } from "@/types";

function Floor() {
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[FLOOR_SIZE, FLOOR_HEIGHT, FLOOR_SIZE]} />
        <meshStandardMaterial color={colors.pastelgreen} metalness={0.25} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default Floor;
