import useDiceStore from "@/stores/diceStore";
import { useRef, useEffect } from "react";
import { Group } from "three";

type Props = {
  color?: string;
}

function DiceModel({ color = '#fff' }: Props) {
  const setDiceModel = useDiceStore((state) => state.setDiceModel);
  const diceRef = useRef<Group | null>(null);

  useEffect(() => {
    if (diceRef.current) setDiceModel(diceRef.current);
  }, [diceRef, setDiceModel]);

  return (
    <group ref={diceRef} name="dice" scale={[0, 0, 0]}>
      <mesh>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default DiceModel;
