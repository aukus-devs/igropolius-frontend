import { SECTOR_CONTENT_ELEVATION, SECTOR_DEPTH } from '@/lib/constants';
import { Vector3Array } from '@/lib/types';
import BuildingModel from '../models/BuildingModel';
import { InstanceProps } from '@react-three/fiber';
import usePlayerStore from '@/stores/playerStore';

type Props = {
  sectorId: number;
  models: React.FC<InstanceProps> & Record<string, React.FC<InstanceProps>>;
};

const ROWS = 4;
const COLS = 4;
const GRID_GAP = 0.25;
const BUILDING_SIZE = 1.25;
const SIZE_WITH_GAP = BUILDING_SIZE + GRID_GAP;
const POSITION_X = SIZE_WITH_GAP * (ROWS / 2) - SIZE_WITH_GAP / 2;
const POSITION_Z = SECTOR_DEPTH / 2 - BUILDING_SIZE;

function getBuildingPosition(index: number): Vector3Array {
  const row = ROWS - 1 - Math.floor(index / COLS);
  const col = COLS - 1 - (index % COLS);

  const x = col * SIZE_WITH_GAP - (COLS - 1) * SIZE_WITH_GAP;
  const z = row * SIZE_WITH_GAP - (ROWS - 1) * SIZE_WITH_GAP;

  return [x, SECTOR_CONTENT_ELEVATION, z];
}

function SectorBuildings({ sectorId, models }: Props) {
  const playerBuildings = usePlayerStore(state => state.buildingsPerSector[sectorId]) || [];
  // const playerBuildings = useMemo(() => getDemoBuildings(sectorId), [sectorId]);

  return (
    <group position={[POSITION_X, 0, POSITION_Z]}>
      {playerBuildings.map((building, index) => {
        const position = getBuildingPosition(index);

        return (
          <BuildingModel
            key={building.id}
            building={building}
            position={position}
            models={models}
          />
        );
      })}
    </group>
  );
}

export default SectorBuildings;
