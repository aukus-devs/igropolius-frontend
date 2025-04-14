import { FLOOR_HEIGHT, FLOOR_SIZE } from "@/lib/constants";
import { colors } from "@/types";

export function Floor() {
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[FLOOR_SIZE, FLOOR_HEIGHT, FLOOR_SIZE]} />
        <meshStandardMaterial color={colors.pastelgreen} />
      </mesh>
    </group>
  );
}

export default Floor;
