import { sectorsData } from "@/lib/mockData";
import { HALF_BOARD } from "@/lib/constants";
import Sector from "./sector/Sector";
import { calculatePlayerPosition, calculateSectorPosition, getSectorRotation } from "./utils";
import usePlayerStore from "@/stores/playerStore";
import React from "react";
import PlayerModel from "./models/PlayerModel";

function GameBoard() {
  const playersData = usePlayerStore((state) => state.players);

  return (
    <group name="board" position={[-HALF_BOARD, 0, -HALF_BOARD]}>
      {sectorsData.map((sector) => {
        const playersOnSector = playersData.filter((player) => player.sector_id === sector.id);
        const sectorPosition = calculateSectorPosition(sector);
        const rotation = getSectorRotation(sector.position);

        return (
          <React.Fragment key={sector.id}>
            {playersOnSector.map((player, idx) => {
              const playerPosition = calculatePlayerPosition(
                idx,
                playersOnSector.length,
                sector,
              );
              return (
                <PlayerModel
                  key={player.id}
                  player={player}
                  position={playerPosition}
                  rotation={rotation}
                />
              );
            })}

            <Sector
              key={sector.id}
              sector={sector}
              position={sectorPosition}
              rotation={rotation}
            />
          </React.Fragment>
        );
      })}
    </group>
  );
}

export default GameBoard;
