import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSectorStore from "@/stores/sectorStore";
import { Html } from "@react-three/drei";

type Props = {
  id: number;
};

function SectorInfo({ id }: Props) {
  const selectedSector = useSectorStore((state) => state.selectedSector);
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);

  return (
    <>
      <Html pointerEvents="none" style={{ pointerEvents: "none" }} center position={[0, 10, 0]}>
        {selectedSector && isSelected && (
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
      </Html>
    </>
  );
}

export default SectorInfo;
