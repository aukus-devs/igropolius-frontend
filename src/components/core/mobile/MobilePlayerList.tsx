import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";
import PlayerDialog from "../playerDialog/PlayerDialog";

function MobilePlayersList() {
  const { players, myPlayer } = usePlayerStore(
    useShallow((state) => ({
      players: state.players,
      myPlayer: state.myPlayer,
    })),
  );

  return players.length > 0 &&
    (
      <div className="w-full px-4 mx-auto">
        <div className="mb-5 text-2xl font-wide-black">Игроки</div>
        <div className="space-y-2">
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
      </div>
    )
}

export default MobilePlayersList;
