import { Html } from "@react-three/drei";
import { Card, CardContent } from "../ui/card";
import useDiceStore from "@/stores/diceStore";
import { useShallow } from "zustand/shallow";

function DiceRollDisplay() {
  const { rollResult, showRoll } = useDiceStore(
    useShallow((state) => ({ rollResult: state.rollResult, showRoll: state.showRoll })),
  );

  const rollSum = rollResult.reduce((sum, num) => sum + num, 0);

  return (
    <Html zIndexRange={[0, 0]} center>
      <Card
        className="p-1 w-20 items-center scale-0 data-[visible=true]:scale-100 duration-300"
        data-visible={showRoll}
      >
        <CardContent className="text-xl px-1 font-medium">
          {rollSum}&nbsp;({rollResult.join("+")})
        </CardContent>
      </Card>
    </Html>
  );
}

export default DiceRollDisplay;
