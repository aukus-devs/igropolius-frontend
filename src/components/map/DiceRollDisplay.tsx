import { Html } from "@react-three/drei";
import useDiceStore from "@/stores/diceStore";
import { useShallow } from "zustand/shallow";
import { Vector3Array } from "@/lib/types";
import { Card, CardContent } from "../ui/card";

type Props = {
  resultIdx?: number;
  position?: Vector3Array;
}

function DiceRollDisplay({ resultIdx, position }: Props) {
  const { rollResult, showRoll } = useDiceStore(
    useShallow((state) => ({ rollResult: state.rollResult, showRoll: state.showRoll })),
  );

  const rollSum = rollResult.reduce((sum, num) => sum + num, 0);
  const text = resultIdx === undefined
    ? `На кубиках выпало — ${rollSum} (${rollResult[0]} + ${rollResult[1]})`
    : rollResult[resultIdx];

  return (
    <Html zIndexRange={[0, 0]} center position={position} style={{ pointerEvents: 'none' }}>
      <Card className="scale-0 data-[visible=true]:scale-100 duration-300 p-0" data-visible={showRoll}>
        <CardContent
          className="font-roboto-wide-semibold text-[64px] py-1 px-5 leading-[75px] data-[sum=true]:text-[32px] data-[sum=true]:py-2.5 data-[sum=true]:px-9 data-[sum=true]:leading-[38px] whitespace-nowrap"
          data-sum={resultIdx === undefined}
        >
          {text}
        </CardContent>
      </Card>
    </Html>
  );
}

export default DiceRollDisplay;
