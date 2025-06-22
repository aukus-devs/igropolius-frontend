import { PlayerData } from "@/lib/types";
import { Badge } from "../ui/badge";
import { formatMs } from "@/lib/utils";

type Props = {
  player: PlayerData;
};

function CurrentGame({ player }: Props) {
  const { current_game, current_game_updated_at, current_game_cover } = player;

  if (!current_game || !current_game_updated_at) {
    return null;
  }

  const fallbackPoster = "https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png";
  
  const currentTime = Math.floor(Date.now() / 1000);
  const playDuration = currentTime - current_game_updated_at;

  return (
    <div className="font-semibold">
      <div className="w-full flex gap-[3px] justify-between mb-2">
        <div className="text-xs text-white/70 font-wide-semibold">
          Игра на стриме
        </div>
      </div>
      <h3 className="text-2xl mb-2 font-wide-semibold">{current_game}</h3>
      <div className="flex gap-2.5">
        <div className="min-w-[90px] h-[120px] rounded-md overflow-hidden">
          <img className="h-full object-cover" src={current_game_cover || fallbackPoster} alt={current_game} />
        </div>
        <div className="text-muted-foreground">
          <div className="flex flex-wrap gap-2 mb-2.5">
            <Badge className="bg-white/20 text-white/70 font-semibold">
              <p>Играет уже — {formatMs(playDuration * 60 * 60)}</p>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentGame; 