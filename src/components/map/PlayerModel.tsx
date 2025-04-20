import { PLAYER_HEIGHT } from "@/lib/constants";
import useModelsStore from "@/stores/modelsStore";
import { PlayerData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { Group } from "three";
import DiceModel from "./DiceModel";
import MovesCounter from "./MovesCounter";
import usePlayerStore from "@/stores/playerStore";

type Props = {
  player: PlayerData;
  position?: Vector3Array;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

function MyPlayerComponents() {
  return (
    <group position={[0, PLAYER_HEIGHT + 1.5, 0]}>
      <MovesCounter />
      <DiceModel />
    </group>
  );
}

function PlayerModel({ player, position, onClick }: Props) {
  const addPlayerModel = useModelsStore((state) => state.addPlayerModel);
  const myPlayerId = usePlayerStore((state) => state.myPlayerId);
  const isMyPlayer = player.id === myPlayerId;

  const onModelRender = (item: Group) => {
    if (item) {
      addPlayerModel(player.id, item);
    }
  };

  return (
    <group ref={onModelRender} name={`player-${player.id}`} position={position}>
      {isMyPlayer && <MyPlayerComponents />}
      <mesh onClick={(e) => (e.stopPropagation(), onClick?.(e))} castShadow receiveShadow>
        <capsuleGeometry args={[0.5, PLAYER_HEIGHT, 1]} />
        <meshPhongMaterial color={player.color} />
      </mesh>
    </group>
  );
}

export default PlayerModel;
