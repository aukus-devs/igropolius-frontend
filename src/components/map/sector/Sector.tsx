import { SectorData, Vector3Array } from "@/lib/types";
import { Group } from "three";
import useModelsStore from "@/stores/modelsStore";
import SectorBase from "./SectorBase";
import SectorText from "./SectorText";
import SectorBuildings from "./SectorBuildings";
import PrisonModel from "../models/PrisonModel";
import StartModel from "../models/StartModel";
import BonusWheelModel from "../models/BonusWheelModel";
import { InstanceProps } from "@react-three/fiber";
import ParkingModel from "../models/ParkingModel";

type Props = {
  sector: SectorData & {  settings: {
    color: string;
    metalness: number;
    roughness: number;
  }};
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
  const isPrison = sector.type === "prison";
  const isStart = sector.id === 1;
  const isParking = sector.id === 21;
  const isBonusSector = sector.type === "bonus";

  return (
    <group
      ref={onSectorRender}
      name={`sector_${sector.id}`}
      position={position}
      rotation={rotation}
    >
      {isPrison && <PrisonModel />}
      {isStart && <StartModel />}
      {isParking && <ParkingModel />}
      {isBonusSector && <BonusWheelModel />}

      {canHaveBuildings && <SectorBuildings sectorId={sector.id} models={models} />}

      <SectorText text={`${sector.id}`} isCorner={isCorner} />
      <SectorBase
        id={sector.id}
        sector={sector}
        color={sector.color}
        isCorner={isCorner}
      />
    </group>
  );
}

export default Sector;
