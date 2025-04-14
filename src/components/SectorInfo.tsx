import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import useAppStore from "@/stores/appStore";

function SectorInfo() {
  const selectedSector = useAppStore((state) => state.selectedSector);

  return (
    <>
      {selectedSector && (
        <Card className="absolute bottom-4 left-4 w-52">
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
    </>
  );
}

export default SectorInfo;
