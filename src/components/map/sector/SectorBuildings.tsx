import { BUILDING_ELEVATION } from "@/lib/constants";
import { BuildingData, Vector3Array } from "@/types";
import Building from "../Building";

type Props = {
  buildings: BuildingData[];
};

const BuildingPositions: Vector3Array[] = [
  [1.5, BUILDING_ELEVATION, 4.5],
  [0, BUILDING_ELEVATION, 4.5],
  [-1.5, BUILDING_ELEVATION, 4.5],
  [1.5, BUILDING_ELEVATION, 3],
  [0, BUILDING_ELEVATION, 3],
  [-1.5, BUILDING_ELEVATION, 3],
  [1.5, BUILDING_ELEVATION, 1.5],
  [0, BUILDING_ELEVATION, 1.5],
  [-1.5, BUILDING_ELEVATION, 1.5],
  [1.5, BUILDING_ELEVATION, 0],
  [0, BUILDING_ELEVATION, 0],
  [-1.5, BUILDING_ELEVATION, 0],
  [1.5, BUILDING_ELEVATION, -1.5],
  [0, BUILDING_ELEVATION, -1.5],
  [-1.5, BUILDING_ELEVATION, -1.5],
];

function SectorBuildings({ buildings }: Props) {
  return (
    <group name="buildings">
      {buildings.map((building, index) => {
        const position = BuildingPositions[index];
        if (!position) throw new Error((`No position found for building at index ${index}`));

        return (
          <Building
            key={index}
            type={building.type}
            position={BuildingPositions[index]}
            color={building.owner.color}
          />
        );
      })}
    </group>
  );
}

export default SectorBuildings;
