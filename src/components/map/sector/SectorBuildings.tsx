import { BUILDING_SCALE, SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH } from "@/lib/constants";
import { Vector3Array } from "@/types";
import Building from "./Building";
import usePlayerStore from "@/stores/playerStore";

type Props = {
  sectorId: number;
};

const ROWS = 4;
const COLS = 4;
const SPACING = BUILDING_SCALE + BUILDING_SCALE / 2;

function getBuildingPosition(index: number): Vector3Array {

  const row = ROWS - 1 - Math.floor(index / COLS);
  const col = COLS - 1 - (index % COLS);

  const x = (col * SPACING) - (COLS - 1) * SPACING;
  const z = (row * SPACING) - (ROWS - 1) * SPACING;

  return [x, SECTOR_CONTENT_ELEVATION, z];
}

function SectorBuildings({ sectorId }: Props) {
  const buildings = usePlayerStore((state) => state.buildingsPerSector[sectorId]) || [];

  return (
    <group
      name="buildings"
      position={[BUILDING_SCALE / 2 * ROWS, 0, SECTOR_DEPTH / 2 - BUILDING_SCALE]}
    >
      {buildings.map((building, index) => {
        const position = getBuildingPosition(index);

        return (
          <Building
            key={index}
            type={building.type}
            position={position}
            color={building.owner.color}
          />
        );
      })}
    </group>
  );
}

export default SectorBuildings;
