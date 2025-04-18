import { Vector3Array } from "@/types";
import { Text } from "@react-three/drei";

type Props = {
  text: string;
  isCorner: boolean;
};

function SectorText({ text, isCorner }: Props) {
  const position: Vector3Array = isCorner ? [-4.5, 0.1, -4.5] : [0, 0.1, -5];
  const rotation: Vector3Array = isCorner
    ? [Math.PI / 2, Math.PI, Math.PI / 4]
    : [Math.PI / 2, Math.PI, 0];

  return (
    <Text position={position} rotation={rotation} color="black">
      {text}
    </Text>
  );
}

export default SectorText;
