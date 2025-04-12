import { PlayerData } from "@/types";
import Card from "./Card";

type Props = {
  players: PlayerData[];
};

export default function PlayersList({ players }: Props) {
  return (
    <div className="absolute top-10 right-7 w-60 text-16 z-10 flex flex-col gap-[10px]">
      {players.map((player) => (
        <PlayerItem key={player.id} player={player} />
      ))}
    </div>
  );
}

function PlayerItem({ player }: { player: PlayerData }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <div className="text-sm font-medium">{player.name}</div>
          <div className="text-xs text-muted-foreground">{player.sector}</div>
        </div>
      </div>
    </Card>
  );
}
