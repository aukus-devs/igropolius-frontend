import { PlayerData } from "@/types";
import PlayerDialog from "./playerDialog/PlayerDialog";

type Props = {
  players: PlayerData[];
};

function PlayersList({ players }: Props) {
  return (
    <div className="absolute top-10 left-4 flex flex-col gap-2">
      {players.map((player, idx) => (
        <PlayerDialog key={player.id} player={player} placement={idx + 1} />
      ))}
    </div>
  );
}

export default PlayersList;
