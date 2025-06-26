import { Html } from "@react-three/drei";
import { Card, CardContent } from "../ui/card";
import useDiceStore from "@/stores/diceStore";
import { useShallow } from "zustand/shallow";

function DiceRollDisplay() {
  const { rolledNumber, showRoll } = useDiceStore(
    useShallow((state) => ({ rolledNumber: state.rolledNumber, showRoll: state.showRoll })),
  );

  return (
    <Html zIndexRange={[0, 0]} center>
      <Card
        className="p-1 w-10 items-center scale-0 data-[visible=true]:scale-100 duration-300"
        data-visible={showRoll}
      >
        <CardContent className="text-xl px-1 font-medium">{rolledNumber}</CardContent>
      </Card>
    </Html>
  );
}

export default DiceRollDisplay;
