import { PlayerData } from "@/types";
import PlayerCard from "./PlayerCard";

type Props = {
  players: PlayerData[];
};

function PlayersList({ players }: Props) {
  return (
    <div className="absolute top-10 left-4 flex flex-col gap-2">
      {players.map((player, idx) => (
        <PlayerCard key={player.id} {...player} placement={idx + 1} />
      ))}
    </div>
  );
}

export default PlayersList;
