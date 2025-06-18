import { SectorData, Vector3Array } from "@/lib/types";
import { Group } from "three";
import useModelsStore from "@/stores/modelsStore";
import { SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_WIDTH } from "@/lib/constants";
import SectorBase from "./SectorBase";
import SectorText from "./SectorText";
import SectorBuildings from "./SectorBuildings";
import PrisonModel from "../models/PrisonModel";
import FlagModel from "../models/FlagModel";
import BonusWheelModel from "../models/BonusWheelModel";
import { InstanceProps } from "@react-three/fiber";

type Props = {
  sector: SectorData;
  position: Vector3Array;
  rotation: Vector3Array;
  models: React.FC<InstanceProps> & Record<string, React.FC<InstanceProps>>;
  isSelected?: boolean;
};

function Sector({ sector, position, rotation, models }: Props) {
  const addSectorModel = useModelsStore((state) => state.addSectorModel);

  const onSectorRender = (item: Group) => {
    if (item) addSectorModel(sector.id, item);
  };

  const isCorner = ["prison", "start-corner", "parking"].includes(sector.type);
  const canHaveBuildings = ["property", "railroad"].includes(sector.type);
  const showColorGroup = sector.type === "property";
  const shape: Vector3Array = isCorner
    ? [SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_DEPTH]
    : [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH];

  const isPrison = sector.type === "prison";
  const isStart = sector.id === 1;
  const isTopLeftCorner = sector.id === 21;
  const isBonusSector = sector.type === "bonus";

  return (
    <group
      ref={onSectorRender}
      name={`sector_${sector.id}`}
      position={position}
      rotation={rotation}
    >
      {isPrison && <PrisonModel />}
      {isStart && <FlagModel />}
      {isTopLeftCorner && <FlagModel />}
      {isBonusSector && <BonusWheelModel />}

      {canHaveBuildings && <SectorBuildings sectorId={sector.id} models={models} />}

      <SectorText text={`${sector.id}`} isCorner={isCorner} />
      <SectorBase
        id={sector.id}
        sector={sector}
        color={sector.color}
        shape={shape}
        showColorGroup={showColorGroup}
        isCorner={isCorner}
      />
    </group>
  );
}

export default Sector;
