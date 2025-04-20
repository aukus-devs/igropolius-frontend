import { SectorsById, sectorsData } from "@/lib/mockData";
import { FLOOR_CENTER_POSITION } from "@/lib/constants";
import { PlayerData, SectorData, Vector3Array } from "@/types";
import PlayerModel from "./PlayerModel";
import Sector from "./sector/Sector";
import { calculatePlayerPosition, calculateSectorPosition } from "./utils";
import usePlayerStore from "@/stores/playerStore";

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
  const sector = SectorsById[player.current_position];
  if (!sector) throw new Error(`Sector with id ${player.current_position} not found`);

  const position = calculatePlayerPosition(sector);
  return <PlayerModel player={player} position={position} />;
}

function SectorWrapper({ sector }: { sector: SectorData }) {
  const sectorSide = getSectorSide(sector);
  const position = calculateSectorPosition(sector);
  const rotation = getSectorRotation(sectorSide);

  return <Sector sector={sector} position={position} rotation={rotation} />;
}

function GameBoard() {
  const playersData = usePlayerStore((state) => state.players);
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

function getSectorRotation(position: SectorPosition): Vector3Array {
  switch (position) {
    case "bottom":
      return [0, 0, 0];
    case "top":
      return [0, Math.PI, 0];
    case "left":
      return [0, Math.PI / 2, 0];
    case "right":
      return [0, -Math.PI / 2, 0];
    case "bottom-left":
      return [0, 0, 0];
    case "bottom-right":
      return [0, -Math.PI / 2, 0];
    case "top-left":
      return [0, Math.PI / 2, 0];
    case "top-right":
      return [0, Math.PI, 0];

    default:
      throw new Error(`Unknown sector position: ${position}`);
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
