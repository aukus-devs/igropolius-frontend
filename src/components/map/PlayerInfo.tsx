import { Html } from '@react-three/drei';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlayerDetails } from '@/lib/api-types-generated';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';

type Props = {
  player: PlayerDetails;
  isHighlighted?: boolean;
};

function PlayerInfo({ player, isHighlighted = false }: Props) {
  const outlineWidth = isHighlighted ? '4px' : '2px';
  const avatarSize = isHighlighted ? '52px' : '40px';

  return (
    <Html zIndexRange={[0, 0]} style={{ pointerEvents: 'none' }} center position={[0, 3.5, 0]}>
      <Avatar
        style={{
          outline: `${outlineWidth} solid ${player.color}`,
          width: avatarSize,
          height: avatarSize,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <AvatarImage src={player.avatar_link ?? FALLBACK_AVATAR_URL} />
        <AvatarFallback className="uppercase">{player.username.slice(0, 2)}</AvatarFallback>
      </Avatar>
    </Html>
  );
}

export default PlayerInfo;
