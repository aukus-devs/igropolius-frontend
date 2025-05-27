import { PLAYER_HEIGHT, STORAGE_BASE_URL } from "@/lib/constants";
import useModelsStore from "@/stores/modelsStore";
import { PlayerData, Vector3Array } from "@/lib/types";
import { ThreeEvent } from "@react-three/fiber";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import DiceModel from "./DiceModel";
import MovesCounter from "./MovesCounter";
import usePlayerStore from "@/stores/playerStore";
import { Gltf } from "@react-three/drei";
import { useEffect, useRef } from "react";
import PlayerInfo from "./PlayerInfo";

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
    <group position={[0, PLAYER_HEIGHT + 3, 0]}>
      <MovesCounter />
      <DiceModel />
    </group>
  );
}

function PlayerModel({ player, position, rotation, onClick }: Props) {
  const addPlayerModel = useModelsStore((state) => state.addPlayerModel);
  const isMyPlayer = usePlayerStore((state) => state.myPlayer?.id === player.id);
  const groupRef = useRef<Group>(null);
  const modelUrl = ModelsUrls[player.nickname.toLowerCase()];

  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.traverse((child) => {
      if (child instanceof Mesh) {
        child.material.emissiveIntensity = 0.25;
        child.material = new MeshStandardMaterial({
          color: new Color(player.color)
        });
      }
    })

    addPlayerModel(player.id, groupRef.current);
  }, [addPlayerModel, player.id, player.color]);

  return (
    <group
      ref={groupRef}
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
      <PlayerInfo player={player} />
      {isMyPlayer && <MyPlayerComponents />}
    </group>
  );
}

export default PlayerModel;
