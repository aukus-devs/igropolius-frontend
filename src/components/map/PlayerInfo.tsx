import { Html } from '@react-three/drei';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlayerDetails } from '@/lib/api-types-generated';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';

type Props = {
  player: PlayerDetails;
};

function PlayerInfo({ player }: Props) {
  return (
    <Html zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }} center position={[0, 3.5, 0]}>
      <Avatar style={{ outline: `2px solid ${player.color}` }}>
        <AvatarImage src={player.avatar_link ?? FALLBACK_AVATAR_URL} />
        <AvatarFallback className="uppercase">{player.username.slice(0, 2)}</AvatarFallback>
      </Avatar>
    </Html>
  );
}

export default PlayerInfo;
