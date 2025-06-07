import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingData } from "@/lib/types";
import { Html } from "@react-three/drei";

type Props = {
  building: BuildingData;
};

function BuildingInfo({ building }: Props) {
  const { gameTitle, owner, gameLength } = building;

  return (
    <Html
      zIndexRange={[0, 0]}
      pointerEvents="none"
      style={{ pointerEvents: "none" }}
      center
      position={[0, 7, 0]}
    >
      <Card className="w-52 pointer-events-none">
        <CardHeader>
          <CardTitle>{gameTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Владелец: {owner.username}</p>
          <p className="text-sm">Длительность: {gameLength}</p>
        </CardContent>
      </Card>
    </Html>
  );
}

export default BuildingInfo;
