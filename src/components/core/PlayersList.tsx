import PlayerDialog from "./playerDialog/PlayerDialog";
import { Button } from "../ui/button";
import { useState } from "react";
import usePlayerStore from "@/stores/playerStore";
import Clock from "./Clock";

function PlayersList() {
  const players = usePlayerStore((state) => state.players);
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[#494949] roboto-flex-wide text-sm">
          МСК — <Clock />
        </span>

        <Button
          variant="outline"
          className="relative rounded-md px-2 py-0.5 h-[1.5rem] items-center font-semibold backdrop-blur-[1.5rem] bg-card/60 border-none roboto-flex-wide text-xs text-muted-foreground"
          onClick={() => setIsCompact(!isCompact)}
        >
          {isCompact ? 'Раскрыть' : 'Скрыть'}
        </Button>
      </div>
      {players.map((player, idx) => (
        <PlayerDialog
          key={player.id}
          player={player}
          placement={idx + 1}
          isHidden={isCompact}
          zIndex={players.length - idx}
        />
      ))}
    </div>
  );
}

export default PlayersList;
