import { PlayerData } from "@/lib/types";
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
  zIndex: number;
  isHidden: boolean;
};

function PlayerDialog({ player, placement, zIndex, isHidden }: Props) {
  const cameraToPlayer = useCameraStore((state) => state.cameraToPlayer);

  const collapseToPlacement = 3;
  const translatePercent = 105;
  const translateY = -translatePercent * (placement - collapseToPlacement);
  const isCollapsible = isHidden && placement > collapseToPlacement;

  return (
    <div
      className="group relative transition-[transform,opacity] duration-300"
      style={{
        transform: isCollapsible ? `translateY(${translateY}%)` : "translateY(0)",
        opacity: isCollapsible ? 0.3 : 1,
        pointerEvents: isCollapsible ? "none" : "auto",
        zIndex,
      }}
    >
      <Dialog>
        <DialogTrigger>
          <PlayerDialogTrigger player={player} placement={placement} />
        </DialogTrigger>
        <DialogContent
          className="flex flex-col gap-8 h-[660px] p-0 overflow-hidden"
          aria-describedby=""
        >
          <ScrollArea className="flex h-full">
            <DialogHeader className="relative pt-5 mb-8">
              <DialogTitle className="text-center font-demi text-muted-foreground text-sm">
                LIVE — Hotline Miami
              </DialogTitle>
              <div className="absolute top-0 left-0 z-[-1] w-full h-[240px] blur-2xl">
                <img
                  src={player.avatar_link}
                  className="w-full h-full opacity-50"
                  alt="player avatar"
                />
              </div>
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
