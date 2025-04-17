import { PlayerData } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MapPinIcon, Zap } from "lucide-react";
import useCameraStore from "@/stores/cameraStore";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

type Props = {
  player: PlayerData;
  placement: number;
  onClick?: () => void;
};

function PlayerCard({ player, placement }: Props) {
  const cameraToPlayer = useCameraStore((state) => state.cameraToPlayer);
  const { sectorId, name, avatar } = player;

  const randomPoints = Math.floor(Math.random() * 9999)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="group relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="relative z-20 flex-row gap-2 rounded-xl p-2 w-[16.75rem] h-auto items-center select-none cursor-pointer text-base text-foreground font-semibold backdrop-blur-[1.5rem] bg-card/60 border-none"
            onClick={() => { }}
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar} />
                <AvatarFallback className="uppercase">{name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            <div className="flex flex-col w-full font-semibold">
              <div className="flex justify-between text-base ">
                <div>
                  <span className="text-muted-foreground font-bold">{placement} · </span> {name}
                </div>
                <div className="flex text-muted-foreground items-center gap-1">
                  {randomPoints} <Zap size="1rem" />
                </div>
              </div>
              <div className="text-sm text-muted-foreground self-start">Проводит аукцион</div>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent>
          {player.name}
        </DialogContent>
      </Dialog>
      <Button
        className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-0 bg-card/60 backdrop-blur-[1.5rem] rounded-xl group-hover:translate-x-[calc(100%+0.5rem)] h-full opacity-0 group-hover:opacity-100 items-start p-2 hover:bg-accent"
        onClick={(e) => (e.stopPropagation(), cameraToPlayer(sectorId))}
      >
        <MapPinIcon />
        <div>
          <div className="flex items-center gap-1 font-bold">Показать на карте</div>
          <div className="text-muted-foreground text-sm justify-self-start">{player.sectorId} клетка</div>
        </div>
      </Button>
    </div>
  );
}

export default PlayerCard;
