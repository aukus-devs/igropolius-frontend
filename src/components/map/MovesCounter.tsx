import { Html } from "@react-three/drei";
import { Card, CardContent } from "../ui/card";
import useDiceStore from "@/stores/diceStore";

function MovesCounter() {
  const rolledNumber = useDiceStore((state) => state.rolledNumber);

  return (
    <Html center>
      <Card
        className="p-1 w-10 items-center scale-0 data-[open=true]:scale-100 duration-300"
        data-open={!!rolledNumber}
      >
        <CardContent className="text-xl px-1 font-medium">
          {rolledNumber}
        </CardContent>
      </Card>

    </Html>
  );
}

export default MovesCounter;
