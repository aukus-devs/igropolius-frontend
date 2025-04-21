import { PlayerData } from "@/types";
import { MapPinIcon } from "lucide-react";
import useCameraStore from "@/stores/cameraStore";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import PlayerDialogTrigger from "./PlayerDialogTrigger";
import PlayerDialogTabs from "./tabs/PlayerDialogTabs";
import { mockReviews } from "@/lib/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerDialogHeader from "./PlayerDialogHeader";

type Props = {
  player: PlayerData;
  placement: number;
  onClick?: () => void;
};

function PlayerDialog({ player, placement }: Props) {
  const cameraToPlayer = useCameraStore((state) => state.cameraToPlayer);

  return (
    <div className="group relative">
      <Dialog>
        <DialogTrigger>
          <PlayerDialogTrigger player={player} placement={placement} />
        </DialogTrigger>
        <DialogContent
          className="flex flex-col gap-8 h-[660px] p-0 overflow-hidden"
          aria-describedby=""
        >
          <ScrollArea className="flex h-full">
            <DialogHeader className="absolute top-5 mx-auto left-0 right-0">
              <DialogTitle className="text-center font-wide-demi text-muted-foreground text-sm">
                LIVE — Hotline Miami
              </DialogTitle>
            </DialogHeader>

            <PlayerDialogHeader player={player} />
            <PlayerDialogTabs reviews={mockReviews} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Button
        className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-0 bg-card/60 backdrop-blur-[1.5rem] rounded-xl group-hover:translate-x-[calc(100%+0.5rem)] h-full opacity-0 group-hover:opacity-100 p-2 hover:bg-accent items-center text-primary"
        onClick={(e) => (e.stopPropagation(), cameraToPlayer(player.current_position))}
      >
        <MapPinIcon className="mt-1 self-start" />
        <div>
          <div className="flex items-center gap-1 font-bold">Показать на карте</div>
          <div className="text-muted-foreground text-sm justify-self-start">
            {player.current_position} клетка
          </div>
        </div>
      </Button>
    </div>
  );
}

export default PlayerDialog;
