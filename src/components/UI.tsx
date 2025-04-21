import { Button } from "./ui/button";
import usePlayerStore from "@/stores/playerStore";
import PlayersList from "./core/PlayersList";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";
import GameReviewForm from "./core/GameReviewForm";
import RollDeckCard from "./core/RollDeckCard";
import Clock from "./core/Clock";

function MoveButton() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  return (
    <Button variant="outline" onClick={moveMyPlayer} disabled={isPlayerMoving}>
      Ходить
    </Button>
  );
}

function UI() {
  const players = usePlayerStore((state) => state.players);

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-10 overflow-hidden">
      <PlayersList players={players} />

      <div className="absolute right-4 top-10 flex flex-col gap-2 w-[15rem]">
        <QuickMenu />
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <MoveButton />
        <GameReviewForm />
        <RollDeckCard />
      </div>

      <div
        className="absolute top-[10px] left-4 font-wide-black"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        МСК — <Clock />
      </div>

      <div
        className="absolute top-[10px] right-4 font-wide-black"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Твое время — <Clock />
      </div>
    </div>
  );
}

export default UI;
