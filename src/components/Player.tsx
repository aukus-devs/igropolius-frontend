import { CELL_SIDE_SIZE_MULTIPLIER, PLAYER_ELEVATION, PLAYER_HEIGHT } from "@/lib/constants";
import { IEntity } from "@/lib/interfaces";

export function Player(props: IEntity & { onClick?: () => void }) {
  const { color = "#fff", position, onClick } = props;

  const sideSize = CELL_SIDE_SIZE_MULTIPLIER * 10;
  const sideDistanceToCenter = sideSize / 2;

  return (
    <group
      position={[
        position.x * CELL_SIDE_SIZE_MULTIPLIER - sideDistanceToCenter,
        PLAYER_ELEVATION,
        position.y * CELL_SIDE_SIZE_MULTIPLIER - sideDistanceToCenter,
      ]}
    >
      <mesh onClick={onClick}>
        <capsuleGeometry args={[PLAYER_HEIGHT, 0.75, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default Player;
