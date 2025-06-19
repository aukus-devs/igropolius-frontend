import { PlayerData } from "@/lib/types";
import { ArrowLeftIcon, MapPinIcon } from "lucide-react";
import useCameraStore from "@/stores/cameraStore";
import { Button, buttonVariants } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import PlayerDialogTrigger from "./PlayerDialogTrigger";
import PlayerDialogTabs from "./tabs/PlayerDialogTabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerDialogHeader from "./PlayerDialogHeader";
import { cn } from "@/lib/utils";

type Props = {
  player: PlayerData;
  placement: number;
  isCurrentPlayer: boolean;
};

function PlayerDialog({ player, placement, isCurrentPlayer }: Props) {
  const cameraToPlayer = useCameraStore((state) => state.cameraToPlayer);

  return (
    <div className="group/player-dialog relative w-full md:first:mt-[5px] first:mt-2">
      <Dialog>
        <DialogTrigger className="flex w-full mx-auto h-[61px] md:h-auto">
          <PlayerDialogTrigger
            player={player}
            placement={placement}
            isCurrentPlayer={isCurrentPlayer}
          />
        </DialogTrigger>
        <DialogContent
          className="flex flex-col gap-8 md:h-[660px] h-dvh w-screen md:w-[600px] p-0 overflow-hidden"
          aria-describedby=""
        >
          <ScrollArea className="flex h-full">
            <div className="w-full items-center flex md:hidden">
              <DialogClose className={cn(buttonVariants(), "rounded-[10px] h-11 mt-[15px] mx-auto")}>
                <ArrowLeftIcon />
                <span>Назад к списку</span>
              </DialogClose>
            </div>
            <DialogHeader>
              <DialogTitle className="hidden" />
              <PlayerDialogHeader player={player} />
            </DialogHeader>
            <PlayerDialogTabs player={player} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <div className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-0 group-hover/player-dialog:translate-x-[calc(100%+0rem)] h-full opacity-0 group-hover/player-dialog:opacity-100 pl-2 transition-all md:block hidden">
        <Button
          className="bg-card/70 backdrop-blur-[1.5rem] rounded-xl h-full p-2 hover:bg-accent items-center text-primary"
          onClick={(e) => (e.stopPropagation(), cameraToPlayer(player.id))}
        >
          <MapPinIcon className="mt-1 self-start" />
          <div>
            <div className="flex items-center gap-1 font-bold">Показать на карте</div>
            <div className="text-muted-foreground text-sm justify-self-start">
              {player.sector_id} клетка
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default PlayerDialog;
