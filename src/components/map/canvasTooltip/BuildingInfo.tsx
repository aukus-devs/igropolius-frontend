import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeScoreMultiplier, ScoreByGameLength } from "@/lib/constants";
import { BuildingData } from "@/lib/types";
import { formatTsToMonthDatetime } from "@/lib/utils";
import { ZapIcon } from "lucide-react";

type Props = {
  building: BuildingData;
};

function BuildingInfo({ building }: Props) {
  const { gameTitle, owner, gameLength } = building;
  const income =
    gameLength === "drop" ? 0 : ScoreByGameLength[gameLength] * IncomeScoreMultiplier;

  return (
    <Card className="w-56 pointer-events-none">
      <CardHeader>
        <CardTitle>{gameTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Владелец: {owner.username}</p>
        {/* <p className="text-sm">Длительность: {gameLength}</p> */}
        <div className="flex items-center gap-1">
          <p className="text-sm">Доход: {income}</p>
          <ZapIcon size="1rem" />
        </div>
        <p className="text-sm">Построено: {formatTsToMonthDatetime(building.createdAt)}</p>
      </CardContent>
    </Card>
  );
}

export default BuildingInfo;
