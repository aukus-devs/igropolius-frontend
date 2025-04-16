import { SectorData, Vector3Array, colors } from "@/types";
import { Edges, Html, Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import Building from "./Building";
import { Group } from "three";
import useModelsStore from "@/stores/modelsStore";
import SectorInfo from "../SectorInfo";
import useSectorStore from "@/stores/sectorStore";

type Props = {
  sector: SectorData;
  position: Vector3Array;
  rotation: Vector3Array;
  shape: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
};

function Sector({ sector, shape, position, rotation }: Props) {
  const isSelected = useSectorStore((state) => state.selectedSector?.id === sector.id);
  const setSelectedSectorId = useSectorStore((state) => state.setSelectedSectorId);
  const addSectorModel = useModelsStore((state) => state.addSectorModel);
  const sectorRef = useRef<Group | null>(null);
  const canHaveBuildings = sector.type === "property";

  const buildings = useMemo(() => {
    if (!canHaveBuildings) return null;

    return (
      <group name="buildings">
        <Building type="height-6" position={[2, 0, 5]} color={colors.blue} />
        <Building type="height-5" position={[0.5, 0, 5]} color={colors.red} />
        <Building type="height-4" position={[-1, 0, 5]} color={colors.brown} />
        <Building type="height-3" position={[2, 0, 3.5]} color={colors.green} />
        <Building type="height-2" position={[0.5, 0, 3.5]} color={colors.yellow} />
        <Building type="height-1" position={[-1, 0, 3.5]} color={colors.pink} />
      </group>
    );
  }, [canHaveBuildings]);

  const textId = useMemo(() => {
    const isCorner = sector.type === "corner";
    const textPosition: Vector3Array = isCorner ? [-5, 0.2, -5] : [0, 0.2, -5];
    const textRotation: Vector3Array = isCorner
      ? [Math.PI / 2, Math.PI, Math.PI / 4]
      : [Math.PI / 2, Math.PI, 0];

    return (
      <Text position={textPosition} rotation={textRotation} fontSize={1} color="black">
        {sector.id}
      </Text>
    );
  }, [sector.id, sector.type]);

  useEffect(() => {
    if (sectorRef.current) {
      addSectorModel(sectorRef.current);
    }
  }, [sectorRef, addSectorModel]);

  return (
    <group
      ref={sectorRef}
      name={`sector_${sector.id}`}
      position={position}
      rotation={rotation}
    >
      <mesh
        onClick={(e) => (e.stopPropagation(), setSelectedSectorId(sector.id))}
        onPointerMissed={() => setSelectedSectorId(null)}
      >
        <boxGeometry args={shape} />
        <meshStandardMaterial color={sector.color} emissive={isSelected ? "white" : 0} />
        <Edges scale={1.01} color="black" />
      </mesh>

      {buildings}
      {textId}

      <Html center position={[0, 10, 0]}>
        {isSelected && <SectorInfo />}
      </Html>
    </group>
  );
}

export default Sector;
