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
      <div className="absolute top-2 left-4 flex flex-col gap-2">
        <div className="text-[#494949] font-wide-black">
          МСК — <Clock />
        </div>
        <PlayersList players={players} />
      </div>

      <div className="absolute right-4 top-2 flex flex-col gap-2 w-[15rem]">
        <div className="text-[#494949] font-wide-black">
          Твое время — <Clock />
        </div>
        <QuickMenu />
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <MoveButton />
        <GameReviewForm />
        <RollDeckCard />
      </div>
    </div>
  );
}

export default UI;
