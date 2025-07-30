import { Badge } from '../ui/badge';
import { formatMs } from '@/lib/utils';
import { FALLBACK_GAME_POSTER } from '@/lib/constants';
import { PlayerDetails } from '@/lib/api-types-generated';

type Props = {
  player: PlayerDetails;
};

function CurrentGame({ player }: Props) {
  const { current_game, current_game_duration, current_game_cover } = player;

  if (!current_game || !current_game_duration) {
    return null;
  }

  return (
    <div className="font-semibold">
      <div className="w-full flex justify-between mb-2">
        <div className="text-white/70 font-wide-semibold text-xs">Игра на стриме</div>
      </div>
      <h3 className="text-2xl mb-2.5 font-wide-semibold">{current_game}</h3>
      <div className="flex gap-2.5">
        <div className="min-w-[90px] h-[120px] rounded-md overflow-hidden">
          <img
            className="h-full object-cover"
            src={current_game_cover || FALLBACK_GAME_POSTER}
            alt={current_game}
          />
        </div>
        <div className="text-muted-foreground">
          <div className="flex flex-wrap gap-2 mb-2.5">
            <Badge className="bg-white/20 text-white/70 font-semibold">
              <p>Играет уже — {formatMs(current_game_duration * 1000)}</p>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentGame;
