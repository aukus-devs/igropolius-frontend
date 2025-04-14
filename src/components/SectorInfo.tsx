import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import useSectorStore from "@/stores/sectorStore";

function SectorInfo() {
  const selectedSector = useSectorStore((state) => state.selectedSector);

  return (
    <>
      {selectedSector && (
        <Card className="w-52 pointer-events-none">
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
