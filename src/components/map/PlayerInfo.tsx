import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerData } from "@/lib/types";
import { Html } from "@react-three/drei";

type Props = {
  player: PlayerData;
};

function PlayerInfo({ player }: Props) {
  const { nickname, total_score } = player;

  return (
    <>
      <Html
        zIndexRange={[0, 0]}
        pointerEvents="none"
        style={{ pointerEvents: "none" }}
        center
        position={[0, 5, 0]}
      >
        <Card className="w-52 pointer-events-none">
          <CardHeader>
            <CardTitle>{nickname}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Очки: {total_score}</p>
          </CardContent>
        </Card>
      </Html>
    </>
  );
}

export default PlayerInfo;
