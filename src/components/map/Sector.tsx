import { colors, PlayerData, SectorData, Vector3Array } from "@/types";
import { Edges, Text } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import Building from "./Building";
import PlayerModel from "./PlayerModel";

type Props = {
  sector: SectorData;
  players: PlayerData[];
  position: Vector3Array;
  rotation: Vector3Array;
  shape: Vector3Array;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void;
};

export function Sector({
  sector,
  players,
  shape,
  position,
  rotation,
  onClick,
  onPointerOver,
  onPointerLeave,
  isSelected,
}: Props) {
  const canHaveBuildings = sector.type === "property";

  return (
    <group name={`${sector.id}`} position={position} rotation={rotation}>
      <group name="players">
        {players.map((p, idx) => (
          <PlayerModel player={p} key={idx} />
        ))}
      </group>
      <mesh
        onClick={(e) => (e.stopPropagation(), onClick?.(e))}
        onPointerOver={(e) => (e.stopPropagation(), onPointerOver?.(e))}
        onPointerLeave={onPointerLeave}
      >
        <boxGeometry args={shape} />
        <meshStandardMaterial color={sector.color} emissive={isSelected ? "white" : 0} />
        <Edges scale={1.01} color="black" />
      </mesh>
      {canHaveBuildings && (
        <group name="buildings">
          <Building type="small" position={[2, 0, 5]} color={colors.blue} />
          <Building type="large" position={[0.5, 0, 5]} color={colors.red} />
          <Building type="biggest" position={[-1, 0, 5]} color={colors.brown} />
          <Building type="large" position={[2, 0, 3.5]} color={colors.green} />
          <Building type="biggest" position={[0.5, 0, 3.5]} color={colors.yellow} />
          <Building type="small" position={[-1, 0, 3.5]} color={colors.pink} />
          <Building type="biggest" position={[2, 0, 2]} color={colors.orange} />
          <Building type="small" position={[0.5, 0, 2]} color={colors.lightblue} />
          <Building type="large" position={[-1, 0, 2]} color={colors.biege} />
        </group>
      )}
      <Text
        position={[0, 0.2, -5]}
        rotation={[Math.PI / 2, Math.PI, 0]}
        fontSize={1}
        color="black"
      >
        {sector.id}
      </Text>
    </group>
  );
}

export default Sector;
