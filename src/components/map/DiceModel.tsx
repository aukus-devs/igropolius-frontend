import useDiceStore from "@/stores/diceStore";
import { Group } from "three";

type Props = {
  color?: string;
};

function DiceModel({ color = "#fff" }: Props) {
  const setDiceModel = useDiceStore((state) => state.setDiceModel);

  const onRender = (el?: Group) => {
    if (el) {
      setDiceModel(el);
    }
  };

  return (
    <group ref={onRender} name="dice" scale={[0, 0, 0]}>
      <mesh>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export default DiceModel;
