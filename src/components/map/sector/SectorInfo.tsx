import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSectorStore from "@/stores/sectorStore";
import { SectorData } from "@/lib/types";
import { Html } from "@react-three/drei";

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);

  return (
    <Html
      zIndexRange={[0, 0]}
      pointerEvents="none"
      style={{ pointerEvents: "none" }}
      center
      position={[0, 10, 0]}
    >
      {isSelected && (
        <Card className="w-52 pointer-events-none">
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <p className="text-xs text-muted-foreground">#{id}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Тип: {type}</p>
            <p className="text-sm">Ролл игры: {rollType}</p>
          </CardContent>
        </Card>
      )}
    </Html>
  );
}

export default SectorInfo;
