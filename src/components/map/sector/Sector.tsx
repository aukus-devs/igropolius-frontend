import { SectorData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import useModelsStore from "@/stores/modelsStore";
import { SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_WIDTH, TrainsConfig } from "@/lib/constants";
import SectorInfo from "./SectorInfo";
import SectorBase from "./SectorBase";
import SectorText from "./SectorText";
import SectorBuildings from "./SectorBuildings";
import usePlayerStore from "@/stores/playerStore";
import TrainModel from "./TrainModel";
import PrisonModel from "./PrisonModel";
import FlagModel from "./FlagModel";

type Props = {
  sector: SectorData;
  position: Vector3Array;
  rotation: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
};

function Sector({ sector, position, rotation }: Props) {
  const addSectorModel = useModelsStore((state) => state.addSectorModel);
  const sectorRef = useRef<Group | null>(null);

  useEffect(() => {
    if (sectorRef.current) addSectorModel(sectorRef.current);
  }, [sectorRef, addSectorModel]);

  const buildings = usePlayerStore((state) => state.buildingsPerSector[sector.id] ?? []);

  const isCorner = ["prison", "utility"].includes(sector.type);
  const canHaveBuildings = ["property", "railroad"].includes(sector.type);
  const showColorGroup = sector.type === "property";
  const shape: Vector3Array = isCorner
    ? [SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_DEPTH]
    : [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH];

  const isPrison = sector.type === "prison";
  const train = TrainsConfig.find((train) => train.sectorFrom === sector.id);
  const isStart = sector.id === 1;
  const isTopLeftCorner = sector.id === 21;

  return (
    <group
      ref={sectorRef}
      name={`sector_${sector.id}`}
      position={position}
      rotation={rotation}
    >
      <SectorInfo id={sector.id} />

      {canHaveBuildings && <SectorBuildings buildings={buildings} />}
      {train && <TrainModel train={train} />}
      {isPrison && <PrisonModel />}
      <SectorText text={`${sector.id}`} isCorner={isCorner} />
      {isStart && <FlagModel />}
      {isTopLeftCorner && <FlagModel />}

      <SectorBase
        id={sector.id}
        color={sector.color}
        shape={shape}
        showColorGroup={showColorGroup}
      />
    </group>
  );
}

export default Sector;
