import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlayerData } from '@/lib/types';
import { Share } from '@/components/icons';
import { FALLBACK_AVATAR_URL } from '@/lib/constants';

type Props = {
  player: PlayerData;
  placement: number;
  isCurrentPlayer: boolean;
};

function PlayerDialogTrigger({ player, placement, isCurrentPlayer }: Props) {
  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        `group relative z-20 flex items-start flex-row gap-2 rounded-xl md:p-2 p-2.5 w-full h-auto select-none cursor-pointer text-base text-foreground font-semibold backdrop-blur-[1.5rem] bg-card/70 border-none`
      )}
      data-highlighted={isCurrentPlayer}
    >
      <div className="relative">
        <Avatar className="md:w-7 md:h-7 w-[41px] h-[41px]">
          <AvatarImage src={player.avatar_link ?? FALLBACK_AVATAR_URL} />
          <AvatarFallback className="uppercase">{player.username.slice(0, 2)}</AvatarFallback>
        </Avatar>
        {player.is_online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500" />
        )}
      </div>
      <div className="flex flex-col w-full md:gap-[3px] gap-[5px]">
        <div className="flex justify-between text-base leading-[19px]">
          <div className="font-bold">{player.username}</div>
          <div className="flex text-muted-foreground items-center font-semibold group-data-[highlighted=true]:text-foreground">
            {player.total_score} <Share />
          </div>
        </div>
        <div className="flex text-sm text-muted-foreground  font-semibold w-full leading-[17px]">
          <span className="w-full text-start whitespace-break-spaces">
            {player.current_game || 'Выбирает игру...'}
          </span>
          <span className="text-white/20 self-end">#{placement}</span>
        </div>
      </div>
    </div>
  );
}

export default PlayerDialogTrigger;
