import { PlayerData } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MapPinIcon, Zap } from "lucide-react";
import useCameraStore from "@/stores/cameraStore";
import useModelsStore from "@/stores/modelsStore";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

type Props = {
  player: PlayerData;
  placement: number;
  onClick?: () => void;
};

function PlayerCard({ player, placement }: Props) {
  const { sectorId, name, avatar } = player;
  const cameraControls = useCameraStore((state) => state.cameraControls);
  const getSectorModel = useModelsStore((state) => state.getSectorModel);
  const randomPoints = Math.floor(Math.random() * 9999)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  async function cameraToPlayer() {
    if (!cameraControls) return;

    const sectorModel = getSectorModel(sectorId);

    if (sectorModel) {
      let targetRotationY = sectorModel.rotation.y;

      if (targetRotationY === Math.PI) {
        targetRotationY -= Math.PI;
      } else if (targetRotationY === 0) {
        targetRotationY += Math.PI;
      } else {
        targetRotationY = -targetRotationY;
      }

      const cameraAzimuth = cameraControls.azimuthAngle ?? 0;
      const base = Math.floor(cameraAzimuth / (Math.PI * 2));
      const targetAzimuth = base * Math.PI * 2 + targetRotationY;

      cameraControls.fitToBox(sectorModel, true, { cover: true });
      cameraControls.rotateTo(targetAzimuth, Math.PI / 4, true);
      cameraControls.dollyTo(15, true);
    }
  }

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
        className="absolute z-10 right-0 top-1/2 -translate-y-1/2 translate-x-0 rounded-xl group-hover:translate-x-[calc(100%+0.5rem)]"
        onClick={(e) => (e.stopPropagation(), cameraToPlayer())}
      >
        <MapPinIcon />Показать на карте
      </Button>
    </div>
  );
}

export default PlayerCard;
