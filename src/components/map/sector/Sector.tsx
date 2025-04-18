import { SectorData, Vector3Array } from "@/types";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";
import useModelsStore from "@/stores/modelsStore";
import { SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_WIDTH } from "@/lib/constants";
import SectorInfo from "./SectorInfo";
import SectorBase from "./SectorBase";
import SectorText from "./SectorText";
import SectorBuildings from "./SectorBuildings";
import usePlayerStore from "@/stores/playerStore";

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

  const getBuildings = usePlayerStore((state) => state.getBuildings);

  const isCorner = sector.type === "corner";
  const canHaveBuildings = ["property", "railroad"].includes(sector.type);
  const shape: Vector3Array = isCorner
    ? [SECTOR_DEPTH, SECTOR_HEIGHT, SECTOR_DEPTH]
    : [SECTOR_WIDTH, SECTOR_HEIGHT, SECTOR_DEPTH];

  useEffect(() => {
    if (sectorRef.current) addSectorModel(sectorRef.current);
  }, [sectorRef, addSectorModel]);

  const buildings = getBuildings(sector.id);

  return (
    <group
      ref={sectorRef}
      name={`sector_${sector.id}`}
      position={position}
      rotation={rotation}
    >
      <SectorInfo id={sector.id} />

      {canHaveBuildings && <SectorBuildings buildings={buildings} />}
      <SectorText text={`${sector.id}`} isCorner={isCorner} />

      <SectorBase
        id={sector.id}
        color={sector.color}
        shape={shape}
        canHaveBuildings={canHaveBuildings}
      />
    </group>
  );
}

export default Sector;
