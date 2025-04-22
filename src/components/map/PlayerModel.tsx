import { PLAYER_HEIGHT, STORAGE_BASE_URL } from "@/lib/constants";
import * as THREE from "three";
import useModelsStore from "@/stores/modelsStore";
import { PlayerData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { Group } from "three";
import DiceModel from "./DiceModel";
import MovesCounter from "./MovesCounter";
import usePlayerStore from "@/stores/playerStore";
import { Gltf } from "@react-three/drei";

const ModelsUrls: Record<string, string> = {
  praden: `${STORAGE_BASE_URL}/models/players/cars/garbage-truck.glb`,
  "player-2": `${STORAGE_BASE_URL}/models/players/cars/delivery.glb`,
  "player-3": `${STORAGE_BASE_URL}/models/players/cars/race-future.glb`,
  "player-4": `${STORAGE_BASE_URL}/models/players/cars/sedan-sports.glb`,
  "player-5": `${STORAGE_BASE_URL}/models/players/cars/tractor.glb`,
  "player-6": `${STORAGE_BASE_URL}/models/players/cars/delivery-flat.glb`,
  "player-7": `${STORAGE_BASE_URL}/models/players/cars/truck.glb`,
  "player-8": `${STORAGE_BASE_URL}/models/players/cars/van.glb`,
};

type Props = {
  player: PlayerData;
  position: Vector3Array;
  rotation: Vector3Array;
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

function PlayerModel({ player, position, rotation, onClick }: Props) {
  const addPlayerModel = useModelsStore((state) => state.addPlayerModel);
  const isMyPlayer = usePlayerStore((state) => state.myPlayer?.id === player.id);

  const modelUrl = ModelsUrls[player.nickname.toLowerCase()];

  const onModelRender = (model: Group) => {
    if (model) {
      addPlayerModel(player.id, model);
    }
  };

  return (
    <group
      ref={onModelRender}
      name={`player_${player.id}`}
      position={position}
      rotation={rotation}
    >
      <Gltf
        src={modelUrl}
        onClick={(e) => (e.stopPropagation(), onClick?.(e))}
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
      />
      {isMyPlayer && <MyPlayerComponents />}
    </group>
  );
}

export default PlayerModel;
