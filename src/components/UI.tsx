import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import useAppStore from "@/stores/appStore";
import SectorInfo from "./SectorInfo";

function UI() {
  const rolledNumber = useAppStore((state) => state.rolledNumber);
  const moveMyPlayer = useAppStore((state) => state.moveMyPlayer);
  const isPlayerMoving = useAppStore((state) => state.isPlayerMoving);

  return (
    <div>
      <Card className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <CardContent>Выпало: {rolledNumber || "—"}</CardContent>
      </Card>

      <SectorInfo />

      <Button
        variant="outline"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        onClick={moveMyPlayer}
        disabled={isPlayerMoving}
      >
        Ходить
      </Button>
    </div>
  );
}

export default UI;
