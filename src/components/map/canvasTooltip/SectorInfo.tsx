import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectorData } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";
import { IncomeScoreMultiplier, ScoreByGameLength, TaxScoreMultiplier } from "@/lib/constants";
import { useShallow } from "zustand/shallow";
import { Share } from "@/components/icons";

type Props = {
  sector: SectorData;
};

function SectorInfo({ sector }: Props) {
  const { id, name, type, rollType } = sector;

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
    <Card className="w-52 pointer-events-none">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <p className="text-xs text-muted-foreground">#{id}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Тип: {type}</p>
        <p className="text-sm">Ролл игры: {rollType}</p>
        {showTax && (
          <div className="flex gap-1 items-center">
            <p className="text-sm">Налог: {totalTaxValue}</p>
            <Share />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SectorInfo;
