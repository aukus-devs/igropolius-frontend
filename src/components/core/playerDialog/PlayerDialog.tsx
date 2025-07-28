import useCameraStore from '@/stores/cameraStore';
import { Button, buttonVariants } from '../../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import PlayerDialogTrigger from './PlayerDialogTrigger';
import PlayerDialogTabs from './tabs/PlayerDialogTabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import PlayerDialogHeader from './PlayerDialogHeader';
import { cn } from '@/lib/utils';
import { ArrowLeft, Location } from '@/components/icons';
import PlayerCards from './PlayerCards';
import { PlayerDetails } from '@/lib/api-types-generated';

type Props = {
  player: PlayerDetails;
  placement: number;
  isCurrentPlayer: boolean;
  showCards?: boolean;
};

function PlayerDialog({ player, placement, isCurrentPlayer, showCards }: Props) {
  const cameraToPlayer = useCameraStore(state => state.cameraToPlayer);

  return (
    <div className="relative w-full md:first:mt-[5px] first:mt-2">
      <div className="group/player-dialog">
        <Dialog>
          <DialogTrigger className="flex w-full mx-auto md:h-auto">
            <PlayerDialogTrigger
              player={player}
              placement={placement}
              isCurrentPlayer={isCurrentPlayer}
            />
          </DialogTrigger>
          <DialogContent
            className="flex flex-col gap-8 md:h-[660px] left-0 bottom-0 h-[calc(100dvh_-_74px)] w-screen md:w-[600px] p-0"
            aria-describedby=""
          >
            <DialogClose
              className={cn(
                buttonVariants(),
                'absolute -top-[74px] left-[15px] rounded-[10px] h-11 mt-[15px] mx-auto md:hidden'
              )}
            >
              <ArrowLeft />
              <span>Назад к списку</span>
            </DialogClose>
            <ScrollArea className="flex h-full">
              <DialogHeader>
                <DialogTitle className="hidden" />
                <PlayerDialogHeader player={player} />
              </DialogHeader>
              <PlayerDialogTabs player={player} />
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {!showCards && (
          <div className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-0 group-hover/player-dialog:translate-x-[calc(100%+0rem)] h-full opacity-0 group-hover/player-dialog:opacity-100 pl-2 transition-all md:block hidden">
            <Button
              className="bg-card/70 backdrop-blur-[1.5rem] rounded-xl h-full p-2 hover:bg-accent items-center"
              onClick={e => (e.stopPropagation(), cameraToPlayer(player.id))}
            >
              <Location className="self-start" style={{ width: '19px', height: '19px' }} />
              <div>
                <div className="flex items-center gap-1 font-bold">Показать на карте</div>
                <div className="text-muted-foreground text-sm justify-self-start font-semibold">
                  {player.sector_id} клетка
                </div>
              </div>
            </Button>
          </div>
        )}
      </div>

      {showCards && (
        <div className="absolute z-10 left-[calc(100%_+_1rem)] top-1/2 -translate-y-1/2 bg-card/70 backdrop-blur-[1.5rem] rounded-xl py-[5px] px-2">
          <PlayerCards player={player} />
        </div>
      )}
    </div>
  );
}

export default PlayerDialog;
