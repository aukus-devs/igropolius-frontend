import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useSectorStore from "@/stores/sectorStore";
import { SectorData } from "@/lib/types";
import { Html } from "@react-three/drei";
import usePlayerStore from "@/stores/playerStore";
import { IncomeScoreMultiplier, ScoreByGameLength, TaxScoreMultiplier } from "@/lib/constants";
import { useShallow } from "zustand/shallow";

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);

  const taxBuildings = usePlayerStore(
    useShallow((state) => {
      const buildings = state.buildingsPerSector[sector.id] || [];
      return buildings.filter((b) => b.type !== "ruins" && b.owner.id !== state.myPlayer?.id);
    }),
  );

  const totalTaxValue =
    taxBuildings.reduce((sum, building) => {
      if (building.gameLength === "drop") {
        return sum;
      }
      return sum + ScoreByGameLength[building.gameLength] * IncomeScoreMultiplier;
    }, 0) * TaxScoreMultiplier;

  const showTax = sector.type === "railroad" || sector.type === "property";

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
            {showTax && <p className="text-sm">Налог: {totalTaxValue}</p>}
          </CardContent>
        </Card>
      )}
    </Html>
  );
}

export default SectorInfo;
