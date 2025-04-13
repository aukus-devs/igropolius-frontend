import { useContext } from "react";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { AppContext } from "@/contexts/AppContext";
import Card from "./core/Card";
import PlayersList from "./core/PlayersList";
import { playersData } from "@/lib/mockData";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";
import LoginCard from "./core/LoginCard";

function UI() {
  const { selectedSector } = useContext(AppContext);

  const players = playersData;

  return (
    <div>
      <Card className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <CardContent>Event 3D</CardContent>
      </Card>
      {selectedSector && (
        <Card className="absolute bottom-10 left-8 w-52 z-10">
          <CardHeader>
            <CardTitle>{selectedSector.name}</CardTitle>
            <p className="text-xs text-muted-foreground">#{selectedSector.id}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Тип: {selectedSector.type}</p>
            <p className="text-sm">Ролл игры: {selectedSector.rollType}</p>
          </CardContent>
        </Card>
      )}
      <LoginCard />
      <PlayersList players={players} />
      <QuickMenu />
      {/* <Notifications /> */}
    </div>
  );
}

export default UI;
