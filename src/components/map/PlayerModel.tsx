import { PLAYER_HEIGHT, STORAGE_BASE_URL } from "@/lib/constants";
import useModelsStore from "@/stores/modelsStore";
import { PlayerData, Vector3Array } from "@/lib/types";
import { ThreeEvent } from "@react-three/fiber";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import DiceModel from "./DiceModel";
import MovesCounter from "./MovesCounter";
import usePlayerStore from "@/stores/playerStore";
import { Gltf } from "@react-three/drei";
import PlayerInfo from "./PlayerInfo";

const ModelsUrls: Record<string, string> = {
  praden: `${STORAGE_BASE_URL}/models/players/cars/garbage-truck1.glb`,
  "player-2": `${STORAGE_BASE_URL}/models/players/cars/delivery2.glb`,
  "player-3": `${STORAGE_BASE_URL}/models/players/cars/race-future1.glb`,
  "player-4": `${STORAGE_BASE_URL}/models/players/cars/sedan-sports2.glb`,
  "player-5": `${STORAGE_BASE_URL}/models/players/cars/tractor2.glb`,
  "player-6": `${STORAGE_BASE_URL}/models/players/cars/delivery-flat2.glb`,
  "player-7": `${STORAGE_BASE_URL}/models/players/cars/truck1.glb`,
  "player-8": `${STORAGE_BASE_URL}/models/players/cars/van1.glb`,
};

type Props = {
  player: PlayerData;
  position: Vector3Array;
  rotation: Vector3Array;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

function MyPlayerComponents() {
  return (
    <group position={[0, PLAYER_HEIGHT + 3, 0]}>
      <MovesCounter />
      <DiceModel />
    </group>
  );
}

function PlayerModel({ player, position, rotation, onClick }: Props) {
  const addPlayerModel = useModelsStore((state) => state.addPlayerModel);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);
  const isMyPlayer = usePlayerStore((state) => state.myPlayer?.id === player.id);
  const modelUrl = ModelsUrls[player.username.toLowerCase()];

  const onGroupRender = (group: Group | null) => {
    if (!group) return;

    group.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.emissiveIntensity = 0.25;
      }
    });

    addPlayerModel(player.id, group);
  };

  const onModelRender = (model: Group | null) => {
    if (!model) return;

    model.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.name === "body001") {
          child.material = new MeshStandardMaterial({
            color: new Color(player.color),
          });
        }
      }
    });
  };

  return (
    <group
      ref={onGroupRender}
      name={`player_${player.id}`}
      position={position}
      rotation={rotation}
    >
      <Gltf
        ref={onModelRender}
        src={modelUrl}
        onClick={(e) => (e.stopPropagation(), onClick?.(e))}
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
      />
      {!isPlayerMoving && <PlayerInfo player={player} />}
      {isMyPlayer && <MyPlayerComponents />}
    </group>
  );
}

export default PlayerModel;
