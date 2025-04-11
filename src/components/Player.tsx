import { PLAYER_ELEVATION, PLAYER_HEIGHT } from "@/lib/constants";
import { PlayerData } from "@/types";

interface Props extends PlayerData {
  onClick?: (e: MouseEvent) => void;
}

export function Player({ name, color = '#fff', onClick }: Props) {
  return (
    <group name={name} position={[0, PLAYER_ELEVATION, 0]}>
      <mesh onClick={onClick}>
        <capsuleGeometry args={[PLAYER_HEIGHT, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default Player;
