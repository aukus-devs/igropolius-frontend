import { Button } from "./ui/button";
import usePlayerStore from "@/stores/playerStore";
import { Card, CardContent } from "./ui/card";
import PlayersList from "./core/PlayersList";
import { playersData } from "@/lib/mockData";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";

function UI() {
  const rolledNumber = usePlayerStore((state) => state.rolledNumber);
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  const players = playersData;

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-10 overflow-hidden">
      <Card className="absolute top-8 left-1/2 -translate-x-1/2">
        <CardContent>Выпало: {rolledNumber || "—"}</CardContent>
      </Card>

      <PlayersList players={players} />

      <div className="absolute right-4 top-10 flex flex-col gap-2 w-[15rem]">
        <QuickMenu />
        <Notifications />
      </div>

      <Button
        variant="outline"
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        onClick={moveMyPlayer}
        disabled={isPlayerMoving}
      >
        Ходить
      </Button>
    </div>
  );
}

export default UI;
