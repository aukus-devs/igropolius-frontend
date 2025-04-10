import { FLOOR_SIZE, PLAYER_ELEVATION, PLAYER_HEIGHT } from "@/lib/constants";
import { IEntity } from "@/lib/interfaces";

export function Player(props: IEntity & { onClick?: () => void }) {
  const { color = '#fff', position, onClick } = props;

  return (
    <group position={[
      position.x - FLOOR_SIZE / 4,
      PLAYER_ELEVATION,
      position.y - FLOOR_SIZE / 4,
    ]}>
      <mesh onClick={onClick}>
        <capsuleGeometry args={[PLAYER_HEIGHT, 0.75, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export default Player;
