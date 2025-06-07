import { PlayerData } from "@/lib/types";
import { Html } from "@react-three/drei";

type Props = {
  player: PlayerData;
};

function PlayerInfo({ player }: Props) {
  return (
    <Html
      zIndexRange={[0, 0]}
      pointerEvents="none"
      style={{ pointerEvents: "none" }}
      center
      position={[0, 2.5, 0]}
    >
      <div className="text-shadow-md/50 whitespace-nowrap">{player.username}</div>
    </Html>
  );
}

export default PlayerInfo;
