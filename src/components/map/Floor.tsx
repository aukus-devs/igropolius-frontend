import { BOARD_SIZE, SECTOR_HEIGHT } from "@/lib/constants";
import { colors } from "@/types";

function Floor() {
  return (
    <group>
      <mesh receiveShadow>
        <boxGeometry args={[BOARD_SIZE, SECTOR_HEIGHT, BOARD_SIZE]} />
        <meshStandardMaterial color={colors.pastelgreen} roughness={0.75} />
      </mesh>
    </group>
  );
}

export default Floor;
