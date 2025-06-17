import useTrainsStore from "@/stores/trainStore";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import usePlayerStore from "@/stores/playerStore";
import { SectorsById } from "@/lib/mockData";
import { useShallow } from "zustand/shallow";
import { TrainsConfig } from "@/lib/constants";

export default function TrainMoveDialog() {
  const rideTrain = useTrainsStore((state) => state.rideTrain);
  const moveData = usePlayerStore(
    useShallow((state) => {
      if (!state.myPlayer) return;

      return {
        currentSector: SectorsById[state.myPlayer.sector_id],
        setNextTurnState: state.setNextTurnState,
      };
    }),
  );

  if (!moveData?.currentSector) {
    return null;
  }

  const targetSector = TrainsConfig[moveData.currentSector.id];
  if (!targetSector) {
    return null;
  }

  return (
    <Card className="p-4">
      <span className="font-wide-semibold">
        Проехать на поезде до сектора {targetSector.sectorTo}?
      </span>
      После действия будет бросок кубика
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => moveData.setNextTurnState({})}
        >
          Остаться
        </Button>
        <Button
          variant="outline"
          className="bg-[#30D158] hover:bg-[#30D158]/70 w-full flex-1"
          onClick={() => rideTrain(moveData.currentSector.id)}
        >
          Ехать
        </Button>
      </div>
    </Card>
  );
}
