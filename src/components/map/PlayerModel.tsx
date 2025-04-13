import { PLAYER_HEIGHT } from "@/lib/constants";
import { myPlayerData } from "@/lib/mockData";
import useAppStore from "@/stores/appStore";
import { PlayerData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

type Props = {
  player: PlayerData;
  position?: Vector3Array;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

export function PlayerModel({ player, position, onClick }: Props) {
  const updateMyPlayerObject = useAppStore(state => state.updateMyPlayerModelRef);
  const playerObjectRef = useRef<Group | null>(null);

  useEffect(() => {
    if (playerObjectRef.current && player.id === myPlayerData.id) {
      updateMyPlayerObject(playerObjectRef.current);
    }
  }, [player.id, updateMyPlayerObject]);

  return (
    <group ref={playerObjectRef} name={player.name} position={position}>
      <mesh onClick={(e) => (e.stopPropagation(), onClick?.(e))}>
        <capsuleGeometry args={[0.5, PLAYER_HEIGHT, 1]} />
        <meshStandardMaterial color={player.color} />
      </mesh>
    </group>
  );
}

export default PlayerModel;
