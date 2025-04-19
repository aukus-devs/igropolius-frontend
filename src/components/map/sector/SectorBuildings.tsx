import { SECTOR_CONTENT_ELEVATION } from "@/lib/constants";
import { BuildingData, Vector3Array } from "@/types";
import Building from "../Building";

type Props = {
  buildings: BuildingData[];
};

const BuildingPositions: Vector3Array[] = [
  [2, SECTOR_CONTENT_ELEVATION, 5],
  [0.5, SECTOR_CONTENT_ELEVATION, 5],
  [-1, SECTOR_CONTENT_ELEVATION, 5],
  [2, SECTOR_CONTENT_ELEVATION, 3.5],
  [0.5, SECTOR_CONTENT_ELEVATION, 3.5],
  [-1, SECTOR_CONTENT_ELEVATION, 3.5],
  [2, SECTOR_CONTENT_ELEVATION, 2],
  [0.5, SECTOR_CONTENT_ELEVATION, 2],
  [-1, SECTOR_CONTENT_ELEVATION, 2],
  [2, SECTOR_CONTENT_ELEVATION, 0.5],
  [0.5, SECTOR_CONTENT_ELEVATION, 0.5],
  [-1, SECTOR_CONTENT_ELEVATION, 0.5],
  [2, SECTOR_CONTENT_ELEVATION, -1],
  [0.5, SECTOR_CONTENT_ELEVATION, -1],
  [-1, SECTOR_CONTENT_ELEVATION, -1],
];

function SectorBuildings({ buildings }: Props) {
  return (
    <group name="buildings">
      {buildings.map((building, index) => {
        const position = BuildingPositions[index];
        if (!position) {
          console.warn(`No position found for building at index ${index}`);
          return null;
        }

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
