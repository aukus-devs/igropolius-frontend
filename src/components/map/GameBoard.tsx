import { playersData, sectorsData } from "@/lib/mockData";
import Sector from "./Sector";
import { FLOOR_CENTER_POSITION, PLAYER_ELEVATION, SECTOR_DEPTH, SECTOR_ELEVATION, SECTOR_OFFSET, SECTOR_WIDTH } from "@/lib/constants";
import { PlayerData, SectorData, Vector3Array } from "@/types";
import useSectorStore from "@/stores/sectorStore";
import { PlayerModel } from "./PlayerModel";

type SectorPosition =
  | "bottom"
  | "top"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

function PlayerWrapper({ player }: { player: PlayerData }) {
  const sector = sectorsData.find((s) => s.id === player.sectorId);
  if (!sector) throw new Error(`Sector with id ${player.sectorId} not found`);

  const position = calculatePosition(sector.position, 'player');

  return <PlayerModel player={player} position={position} />;
}

function SectorWrapper({ sector }: { sector: SectorData }) {
  const isSelected = useSectorStore((state) => state.selectedSector?.id === sector.id);
  const setSelectedSectorId = useSectorStore((state) => state.setSelectedSectorId);

  const sectorSide = getSectorSide(sector);
  const isCorner = ["bottom-left", "bottom-right", "top-left", "top-right"].includes(sectorSide);
  const position = calculatePosition(sector.position, 'sector');
  const boxShape: Vector3Array = isCorner ? [SECTOR_DEPTH, 0.1, SECTOR_DEPTH] : [SECTOR_WIDTH, 0.1, SECTOR_DEPTH];
  const rotation = getSectorRotation(sectorSide);

  return (
    <Sector
      sector={sector}
      position={position}
      rotation={rotation}
      shape={boxShape}
      onClick={() => setSelectedSectorId(sector.id)}
      onPointerOver={() => setSelectedSectorId(sector.id)}
      isSelected={isSelected}
    />
  );
}

function GameBoard() {
  return (
    <group name="board" position={[-FLOOR_CENTER_POSITION, 0, -FLOOR_CENTER_POSITION]}>
      <group name="players">
        {playersData.map((player, idx) => (
          <PlayerWrapper key={idx} player={player} />
        ))}
      </group>

      <group name="sectors">
        {sectorsData.map((sector) => (
          <SectorWrapper key={sector.id} sector={sector} />
        ))}
      </group>
    </group>
  );
}

function calculatePosition(position: SectorData['position'], type: 'player' | 'sector'): Vector3Array {
  const offset = type === 'player' ? SECTOR_OFFSET * 2 : SECTOR_OFFSET;
  const elevation = type === 'player' ? PLAYER_ELEVATION : SECTOR_ELEVATION;

  return [
    position.x * SECTOR_WIDTH + (position.x === 0 ? -offset : position.x === 10 ? offset : 0),
    elevation,
    position.y * SECTOR_WIDTH + (position.y === 0 ? -offset : position.y === 10 ? offset : 0),
  ];
};

function getSectorRotation(position: SectorPosition): Vector3Array {
  switch (position) {
    case "bottom": return [0, 0, 0];
    case "top": return [0, Math.PI, 0];
    case "left": return [0, Math.PI / 2, 0];
    case "right": return [0, -Math.PI / 2, 0];
    case "bottom-left": return [0, 0, 0];
    case "bottom-right": return [0, -Math.PI / 2, 0];
    case "top-left": return [0, Math.PI / 2, 0];
    case "top-right": return [0, Math.PI, 0];

    default: throw new Error(`Unknown sector position: ${position}`);
  }
}

function getSectorSide(sector: SectorData): SectorPosition {
  const { x, y } = sector.position;

  if (x === 0 && y === 0) return "bottom-left";
  if (x === 0 && y === 10) return "top-left";
  if (x === 10 && y === 0) return "bottom-right";
  if (x === 10 && y === 10) return "top-right";
  if (x === 0) return "left";
  if (x === 10) return "right";
  if (y === 0) return "bottom";
  if (y === 10) return "top";

  throw new Error("Sector position not found");
}

export default GameBoard;
