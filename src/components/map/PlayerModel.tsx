import { PLAYER_ELEVATION, PLAYER_HEIGHT } from "@/lib/constants";
import { PlayerData } from "@/types";

type Props = {
  player: PlayerData;
  onClick?: (e: MouseEvent) => void;
};

export function PlayerModel({ player, onClick }: Props) {
  return (
    <group name={player.name} position={[0, PLAYER_ELEVATION, -3]}>
      <mesh onClick={onClick}>
        <capsuleGeometry args={[PLAYER_HEIGHT, 2, 2]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
    </group>
  );
}

export default PlayerModel;
