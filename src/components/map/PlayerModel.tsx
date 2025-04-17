import { PLAYER_HEIGHT } from "@/lib/constants";
import { myPlayerData } from "@/lib/mockData";
import useModelsStore from "@/stores/modelsStore";
import { PlayerData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import DiceModel from "./DiceModel";
import MovesCounter from "./MovesCounter";
import { Edges } from "@react-three/drei";

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
  const playerObjectRef = useRef<Group | null>(null);
  const isMyPlayer = player.id === myPlayerData.id;

  useEffect(() => {
    if (playerObjectRef.current) {
      addPlayerModel(playerObjectRef.current);
    }
  }, [player.id, addPlayerModel]);

  return (
    <group ref={playerObjectRef} name={player.id} position={position}>
      {isMyPlayer && <MyPlayerComponents />}
      <mesh onClick={(e) => (e.stopPropagation(), onClick?.(e))} castShadow receiveShadow>
        <capsuleGeometry args={[0.5, PLAYER_HEIGHT, 1]} />
        <meshPhongMaterial color={player.color} />
        <Edges scale={1.05} threshold={0.01} color="black" />
      </mesh>
    </group>
  );
}

export default PlayerModel;
