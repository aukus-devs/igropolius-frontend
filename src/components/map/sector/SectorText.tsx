import { SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH } from "@/lib/constants";
import { Vector3Array } from "@/lib/types";
import { Text } from "@react-three/drei";

type Props = {
  text: string;
  isCorner: boolean;
};

const SectorBottom = SECTOR_DEPTH / 2 - 1;

function SectorText({ text, isCorner }: Props) {
  const position: Vector3Array = isCorner
    ? [-SectorBottom, SECTOR_CONTENT_ELEVATION + 0.1, -SectorBottom]
    : [0, SECTOR_CONTENT_ELEVATION + 0.1, -SectorBottom];
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
