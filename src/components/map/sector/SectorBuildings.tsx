import { BUILDING_SCALE, SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH } from "@/lib/constants";
import { BuildingType, GameLength, playerColors, Vector3Array } from "@/lib/types";
import Building from "../models/BuildingModel";
// import usePlayerStore from "@/stores/playerStore";
import { playersData } from "@/lib/mockData";

type Props = {
  sectorId: number;
};

const ROWS = 4;
const COLS = 4;
const SPACING = BUILDING_SCALE + BUILDING_SCALE / 2;

function getBuildingPosition(index: number): Vector3Array {
  const row = ROWS - 1 - Math.floor(index / COLS);
  const col = COLS - 1 - (index % COLS);

  const x = col * SPACING - (COLS - 1) * SPACING;
  const z = row * SPACING - (ROWS - 1) * SPACING;

  return [x, SECTOR_CONTENT_ELEVATION, z];
}

function getMaxGames(sectorId: number) {
  const maxGames = 16;

  const types: BuildingType[] = [
    "ruins",
    "height-1",
    "height-2",
    "height-3",
    "height-4",
    "height-5",
    "height-6"
  ];
  const lengths: GameLength[] = ["2-5", "5-10", "10-15", "15-20", "20-25", "25+"]

  return Array.from({ length: maxGames }, () => ({
    type: types[Math.floor(Math.random() * types.length)],
    owner: {
      ...playersData[Math.floor(Math.random() * playersData.length)],
      color: Object.values(playerColors)[Math.floor(Math.random() * Object.values(playerColors).length)],
      avatar_link: "https://github.com/shadcn.png",
    },
    sectorId,
    createdAt: 1,
    gameLength: lengths[Math.floor(Math.random() * lengths.length)],
    gameTitle: "Haste",
  }));
}

function SectorBuildings({ sectorId }: Props) {
  // const buildings = usePlayerStore((state) => state.buildingsPerSector[sectorId]) || [];
  const maxBuildings = getMaxGames(sectorId);

  return (
    <group
      name="buildings"
      position={[(BUILDING_SCALE / 2) * ROWS, 0, SECTOR_DEPTH / 2 - BUILDING_SCALE]}
    >
      {maxBuildings.map((building, index) => {
        const position = getBuildingPosition(index);

        return (
          <Building
            key={index}
            building={building}
            position={position}
          />
        );
      })}
    </group>
  );
}

export default SectorBuildings;
