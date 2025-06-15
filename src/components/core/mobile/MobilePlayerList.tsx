import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";
import PlayerDialog from "../playerDialog/PlayerDialog";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

function MobilePlayersList() {
  const { players, myPlayer } = usePlayerStore(
    useShallow((state) => ({
      players: state.players,
      myPlayer: state.myPlayer,
    })),
  );
  const [isOpened, setIsOpened] = useState(false);
  const PlayersList = useMemo(() => {
    return (
      <div className="group-data-[opened=false]:pointer-events-none space-y-2">
        {players.map((player, idx) => {
          const isCurrentPlayer = myPlayer?.id === player.id;
          return (
            <PlayerDialog
              key={player.id}
              player={player}
              isCurrentPlayer={isCurrentPlayer}
              placement={idx + 1}
            />
          );
        })}
      </div>
    )
  }, [players, myPlayer]);

  return players.length > 0 &&
    (
      <div
        className="group data-[opened=true]:bg-background bg-gradient-to-t from-50% from-background pt-[15px] h-full translate-y-[calc(100%_-_14rem)] data-[opened=true]:translate-y-0 transition-all duration-300 data-[opened=true]:pt-[110px]"
        data-opened={isOpened}
      >
        <div className="w-full px-4 mx-auto">
          <Button
            className="mb-5 text-[32px] font-wide-black bg-transparent hover:bg-transparent"
            onClick={() => setIsOpened(!isOpened)}
          >
            Игроки
          </Button>
          {PlayersList}
        </div>
      </div>
    )
}

export default MobilePlayersList;
