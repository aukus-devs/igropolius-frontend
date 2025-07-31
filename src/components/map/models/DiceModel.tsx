import { Vector3Array } from "@/lib/types";
import useDiceStore from "@/stores/diceStore";
import { Group } from "three";
import DiceRollDisplay from "../DiceRollDisplay";

type Props = {
  id: number;
  position: Vector3Array;
};

function DiceModel({ id, ...props }: Props) {
  const addDiceModel = useDiceStore((state) => state.addDiceModel);

  function onGroupRender(group: Group) {
    if (!group) return;
    addDiceModel(group);
  }

  return (
    <group ref={onGroupRender} {...props} scale={[0, 0, 0]}>
      <DiceRollDisplay resultIdx={id} />
      <mesh>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial />
      </mesh>
    </group>
  );
}

export default DiceModel;
