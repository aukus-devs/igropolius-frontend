import { SectorData, Vector3Array, colors } from "@/types";
import { Edges, Html, Text } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import Building from "./Building";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import useModelsStore from "@/stores/modelsStore";
import SectorInfo from "../SectorInfo";
import useSectorStore from "@/stores/sectorStore";
import { SECTOR_DEPTH, SECTOR_WIDTH } from "@/lib/constants";

type Props = {
  sector: SectorData;
  position: Vector3Array;
  rotation: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
}

type SectorInfoCardProps = {
  id: number;
}

type SectorTextProps = {
  text: string;
  isCorner: boolean;
}

type SectorBaseProps = {
  id: number;
  shape: Vector3Array;
  color: string;
  canHaveBuildings: boolean;
}

function SectorInfoCard({ id }: SectorInfoCardProps) {
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);

  return (
    <Html center position={[0, 10, 0]}>
      {isSelected && <SectorInfo />}
    </Html>
  )
}

function SectorBuildings() {
  return (
    <group name="buildings">
      <Building type="height-6" position={[2, 0, 5]} color={colors.blue} />
      <Building type="height-5" position={[0.5, 0, 5]} color={colors.red} />
      <Building type="height-4" position={[-1, 0, 5]} color={colors.brown} />
      <Building type="height-3" position={[2, 0, 3.5]} color={colors.green} />
      <Building type="height-2" position={[0.5, 0, 3.5]} color={colors.yellow} />
      <Building type="height-1" position={[-1, 0, 3.5]} color={colors.pink} />
    </group>
  )
}

function SectorText({ text, isCorner }: SectorTextProps) {
  const textPosition: Vector3Array = isCorner ? [-5, 0.2, -5] : [0, 0.2, -5];
  const textRotation: Vector3Array = isCorner
    ? [Math.PI / 2, Math.PI, Math.PI / 4]
    : [Math.PI / 2, Math.PI, 0];

  return (
    <Text position={textPosition} rotation={textRotation} fontSize={1} color="black">
      {text}
    </Text>
  );
}

function SectorColoredPlatform({ color }: { color: string }) {
  const shape: Vector3Array = [SECTOR_WIDTH, 0.1, SECTOR_DEPTH / 100 * 15];

  return (
    <mesh position={[0, 0, -SECTOR_DEPTH / 2 + shape[2] / 2]}>
      <boxGeometry args={shape} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.25} />
      <Edges scale={1.01} color="black" />
    </mesh>
  );
}

function SectorBuildingsPlatform({ id, shape, canHaveBuildings }: Omit<SectorBaseProps, 'color'>) {
  const isSelected = useSectorStore((state) => state.selectedSector?.id === id);
  const meshRef = useRef<Mesh>(null);

  const finalShape: Vector3Array = canHaveBuildings ? [SECTOR_WIDTH, 0.1, SECTOR_DEPTH / 100 * 85] : shape;
  const position: Vector3Array = canHaveBuildings ? [0, 0, SECTOR_DEPTH / 2 - finalShape[2] / 2] : [0, 0, 0];
  const color = new Color(colors.pastelgreen);
  const white = new Color("white");
  const black = new Color("black");

  useFrame(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as MeshStandardMaterial;
    material.emissive.lerp(isSelected ? white : black, 0.1);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={finalShape} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.25} />
      <Edges scale={1.01} color="black" />
    </mesh>
  )
}

function SectorBase({ id, color, shape, canHaveBuildings }: SectorBaseProps) {
  const setSelectedSectorId = useSectorStore((state) => state.setSelectedSectorId);

  return (
    <group
      onPointerOver={(e) => (e.stopPropagation(), setSelectedSectorId(id))}
      onPointerMissed={() => setSelectedSectorId(null)}
    >
      <SectorBuildingsPlatform id={id} shape={shape} canHaveBuildings={canHaveBuildings} />
      {canHaveBuildings && <SectorColoredPlatform color={color} />}
    </group>
  )
}

function Sector({ sector, position, rotation }: Props) {
  const addSectorModel = useModelsStore((state) => state.addSectorModel);
  const sectorRef = useRef<Group | null>(null);

  const isCorner = sector.type === "corner";
  const canHaveBuildings = sector.type === "property";
  const shape: Vector3Array = isCorner ? [SECTOR_DEPTH, 0.1, SECTOR_DEPTH] : [SECTOR_WIDTH, 0.1, SECTOR_DEPTH];

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
      <SectorInfoCard id={sector.id} />

      {canHaveBuildings && <SectorBuildings />}
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
