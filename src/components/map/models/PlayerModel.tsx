import { PlayerModelsScales } from '@/lib/constants';
import useModelsStore from '@/stores/modelsStore';
import { Vector3Array } from '@/lib/types';
import { ThreeEvent } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import usePlayerStore from '@/stores/playerStore';
import { Gltf } from '@react-three/drei';
import PlayerInfo from '../PlayerInfo';
import { PlayerDetails } from '@/lib/api-types-generated.ts';
import { getPlayerModelUrl } from '../utils.ts';

type Props = {
  player: PlayerDetails;
  position: Vector3Array;
  rotation: Vector3Array;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
};

function PlayerModel({ player, position, rotation, onClick }: Props) {
  const addPlayerModel = useModelsStore(state => state.addPlayerModel);
  const isPlayerMoving = usePlayerStore(state => state.isPlayerMoving);
  const modelUrl = getPlayerModelUrl(player.model_name);

  const onGroupRender = (group: Group | null) => {
    if (!group) return;

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
        rotation={[0, Math.PI / 2, 0]}
        scale={modelScale}
      />
      {!isPlayerMoving && <PlayerInfo player={player} />}
    </group>
  );
}

export default PlayerModel;
