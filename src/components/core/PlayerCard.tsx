import { PlayerData } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Zap } from "lucide-react";
import useCameraStore from "@/stores/cameraStore";
import useModelsStore from "@/stores/modelsStore";
import { Button } from "../ui/button";

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
    <Button
      variant="outline"
      className="flex-row gap-2 rounded-xl p-2 w-[16.75rem] items-center select-none cursor-pointer justify-start text-base text-foreground font-semibold backdrop-blur-[1.5rem] bg-card/60 border-none"
      onClick={cameraToPlayer}
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
        <div className="text-sm text-muted-foreground">Проводит аукцион</div>
      </div>
    </Button>
  );
}

export default PlayerCard;
