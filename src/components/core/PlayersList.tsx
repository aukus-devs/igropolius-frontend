import PlayerDialog from "./playerDialog/PlayerDialog";
import { Button } from "../ui/button";
import { useState } from "react";
import usePlayerStore from "@/stores/playerStore";
import Clock from "./Clock";
import { useShallow } from "zustand/shallow";

function PlayersList() {
  const { players, myPlayer } = usePlayerStore(
    useShallow((state) => ({
      players: state.players,
      myPlayer: state.myPlayer,
    })),
  );

  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="relative flex flex-col gap-2 !pointer-events-none">
      <div className="flex justify-between items-center !pointer-events-auto">
        <span className="text-[#494949] font-wide-black text-sm">
          МСК — <Clock />
        </span>

        <Button
          variant="outline"
          className="relative rounded-md px-2 py-0.5 h-[1.5rem] items-center font-semibold backdrop-blur-[1.5rem] bg-card/70 border-none font-wide-black text-xs text-muted-foreground"
          onClick={() => setIsCompact(!isCompact)}
        >
          {isCompact ? "Раскрыть" : "Скрыть"}
        </Button>
      </div>
      {players.map((player, idx) => {
        const isCurrentPlayer = myPlayer?.id === player.id;
        return (
          <PlayerDialog
            key={player.id}
            player={player}
            isCurrentPlayer={isCurrentPlayer}
            placement={idx + 1}
            isHidden={isCompact}
            zIndex={players.length - idx}
          />
        );
      })}
    </div>
  );
}

export default PlayersList;
