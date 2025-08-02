import { Html } from '@react-three/drei';
import { Avatar, AvatarImage } from '../ui/avatar';
import { PlayerDetails } from '@/lib/api-types-generated';

type Props = {
  player: PlayerDetails;
};

function PlayerInfo({ player }: Props) {
  return (
    <Html
      zIndexRange={[0, 0]}
      style={{ pointerEvents: 'none' }}
      center
      position={[0, 3.5, 0]}
    >
      <Avatar className="outline-white/50 outline-2">
        <AvatarImage src={player.avatar_link ?? ''} />
      </Avatar>
    </Html>
  );
}

export default PlayerInfo;
