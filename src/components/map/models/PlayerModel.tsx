import { PLAYER_HEIGHT, PlayerModelsScales, PlayerModelsUrls } from '@/lib/constants';
import useModelsStore from '@/stores/modelsStore';
import { PlayerData, Vector3Array } from '@/lib/types';
import { ThreeEvent } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import DiceModel from './DiceModel';
import usePlayerStore from '@/stores/playerStore';
import { Gltf } from '@react-three/drei';
import DiceRollDisplay from '../DiceRollDisplay.tsx';
import PlayerInfo from '../PlayerInfo';

type Props = {
  player: PlayerData;
  position: Vector3Array;
  rotation: Vector3Array;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

function MyPlayerComponents() {
  return (
    <group position={[0, PLAYER_HEIGHT + 3, 0]}>
      <DiceRollDisplay />
      <DiceModel />
    </group>
  );
}

function PlayerModel({ player, position, rotation, onClick }: Props) {
  const addPlayerModel = useModelsStore(state => state.addPlayerModel);
  const isPlayerMoving = usePlayerStore(state => state.isPlayerMoving);
  const isMyPlayer = usePlayerStore(state => state.myPlayer?.id === player.id);
  const modelUrl = PlayerModelsUrls[player.username.toLowerCase()];

  const onGroupRender = (group: Group | null) => {
    if (!group) return;

    group.traverse(child => {
      if (child instanceof Mesh) {
        child.material.emissiveIntensity = 0.25;
      }
    });

    addPlayerModel(player.id, group);
  };

  const onModelRender = (model: Group | null) => {
    if (!model) return;

    model.traverse(child => {
      if (child instanceof Mesh) {
        if (child.name === 'body001') {
          child.material.color.set(player.color);
        }
      }
    });
  };

  const modelScale = PlayerModelsScales[modelUrl] || 1;

  return (
    <group ref={onGroupRender} name={`player_${player.id}`} position={position} rotation={rotation}>
      <Gltf
        ref={onModelRender}
        src={modelUrl}
        onClick={e => (e.stopPropagation(), onClick?.(e))}
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 2, 0]}
        scale={modelScale}
      />
      {!isPlayerMoving && <PlayerInfo player={player} />}
      {isMyPlayer && <MyPlayerComponents />}
    </group>
  );
}

export default PlayerModel;
