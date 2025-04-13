import { Button } from "./ui/button";
import useAppStore from "@/stores/appStore";
import SectorInfo from "./SectorInfo";
import { CardContent } from "./ui/card";
import Card from "./core/Card";
import PlayersList from "./core/PlayersList";
import { playersData } from "@/lib/mockData";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";
import LoginCard from "./core/LoginCard";

function UI() {
  const rolledNumber = useAppStore((state) => state.rolledNumber);
  const moveMyPlayer = useAppStore((state) => state.moveMyPlayer);
  const isPlayerMoving = useAppStore((state) => state.isPlayerMoving);

  const players = playersData;

  return (
    <div>
      <Card className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <CardContent>Выпало: {rolledNumber || "—"}</CardContent>
      </Card>

      <SectorInfo />

      <LoginCard />
      <PlayersList players={players} />
      <QuickMenu />
      <Notifications />

      <Button
        variant="outline"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        onClick={moveMyPlayer}
        disabled={isPlayerMoving}
      >
        Ходить
      </Button>
      {/* <Notifications /> */}
    </div>
  );
}

export default UI;
