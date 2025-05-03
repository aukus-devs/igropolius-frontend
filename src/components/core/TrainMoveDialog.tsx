import useTrainsStore from "@/stores/trainStore";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import usePlayerStore from "@/stores/playerStore";
import { SectorsById } from "@/lib/mockData";
import { useShallow } from "zustand/shallow";
import { TrainsConfig } from "@/lib/constants";

export default function TrainMoveDialog() {
  const moveTrain = useTrainsStore((state) => state.moveTrain);
  const moveData = usePlayerStore(
    useShallow((state) => {
      if (!state.myPlayer) return;

      return {
        currentSector: SectorsById[state.myPlayer.current_position],
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
    <Card className="p-2">
      Проехать на поезде до клетки {targetSector.sectorTo}?
      <div className="flex justify-between mt-2">
        <Button onClick={() => moveTrain(moveData.currentSector.id)}>Ехать</Button>
        <Button onClick={() => moveData.setNextTurnState()}>Остаться</Button>
      </div>
    </Card>
  );
}
