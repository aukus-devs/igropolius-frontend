import { useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AppContext } from "@/contexts/AppContext";

function UI() {
  const { selectedSector } = useContext(AppContext);

  return (
    <div>
      <Card className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <CardContent>Event 3D</CardContent>
      </Card>
      {selectedSector && (
        <Card className="absolute top-8 left-8 w-52 z-10">
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
    </div>
  );
}

export default UI;
