import { Html } from "@react-three/drei";
import { Card, CardContent } from "../ui/card";
import useDiceStore from "@/stores/diceStore";
import { useShallow } from "zustand/shallow";
import { Vector3Array } from "@/lib/types";

type Props = {
  resultIdx?: number;
  position?: Vector3Array;
}

function DiceRollDisplay({ resultIdx, position }: Props) {
  const { rollResult, showRoll } = useDiceStore(
    useShallow((state) => ({ rollResult: state.rollResult, showRoll: state.showRoll })),
  );

  const rollSum = rollResult.reduce((sum, num) => sum + num, 0);

  return (
    <Html zIndexRange={[0, 0]} center position={position} style={{ pointerEvents: 'none' }}>
      <Card
        className="items-center scale-0 data-[visible=true]:scale-100 duration-300 px-2"
        data-visible={showRoll}
      >
        <CardContent className="flex gap-2 text-4xl font-medium">
          <div>{resultIdx !== undefined ? rollResult[resultIdx] : rollSum}</div>
        </CardContent>
      </Card>
    </Html>
  );
}

export default DiceRollDisplay;
