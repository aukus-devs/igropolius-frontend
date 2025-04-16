import { Button } from "./ui/button";
import usePlayerStore from "@/stores/playerStore";
import PlayersList from "./core/PlayersList";
import { playersData } from "@/lib/mockData";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";
import GameReviewForm from "./core/GameReviewForm";

function UI() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  const players = playersData;

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-10 overflow-hidden">
      <PlayersList players={players} />

      <div className="absolute right-4 top-10 flex flex-col gap-2 w-[15rem]">
        <QuickMenu />
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button
          variant="outline"
          onClick={moveMyPlayer}
          disabled={isPlayerMoving}
        >
          Ходить
        </Button>
        <GameReviewForm />
      </div>

    </div>
  );
}

export default UI;
