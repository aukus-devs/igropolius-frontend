import { PlayerModelsScales } from '@/lib/constants';
import useModelsStore from '@/stores/modelsStore';
import { Vector3Array } from '@/lib/types';
import { ThreeEvent } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import usePlayerStore from '@/stores/playerStore';
import useHighlightStore from '@/stores/highlightStore';
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
  const highlightedPlayerId = useHighlightStore(state => state.highlightedPlayerId);
  const isHighlighted = highlightedPlayerId === player.id;
  const modelUrl = getPlayerModelUrl(player.model_name);

  if (player.model_name === '') {
    return null;
  }

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
  const finalScale = isHighlighted ? modelScale * 1.2 : modelScale;

  return (
    <group ref={onGroupRender} name={`player_${player.id}`} position={position} rotation={rotation}>
      {isHighlighted && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshBasicMaterial color={player.color} transparent opacity={0.3} />
        </mesh>
      )}
      <Gltf
        ref={onModelRender}
        src={modelUrl}
        onClick={e => (e.stopPropagation(), onClick?.(e))}
        rotation={[0, Math.PI / 2, 0]}
        scale={finalScale}
      />
      {!isPlayerMoving && <PlayerInfo player={player} isHighlighted={isHighlighted} />}
    </group>
  );
}

export default PlayerModel;
