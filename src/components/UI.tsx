import { Button } from "./ui/button";
import usePlayerStore from "@/stores/playerStore";
import PlayersList from "./core/PlayersList";
import QuickMenu from "./core/QuickMenu";
import Notifications from "./core/Notifications";
import GameReviewForm from "./core/GameReviewForm";
import RollDeckCard from "./core/RollDeckCard";
import Countdown from "./core/Countdown";
import { useShallow } from "zustand/shallow";
import { BonusCardData } from "@/lib/types";
import TrainMoveDialog from "./core/TrainMoveDialog";

function MoveButton() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  return (
    <Button variant="outline" onClick={moveMyPlayer} disabled={isPlayerMoving}>
      Бросить кубик и ходить
    </Button>
  );
}

function UI() {
  const { turnState, setNextTurnState, myPlayer, isPlayerMoving } = usePlayerStore(
    useShallow((state) => ({
      turnState: state.turnState,
      setNextTurnState: state.setNextTurnState,
      myPlayer: state.myPlayer,
      isPlayerMoving: state.isPlayerMoving,
    })),
  );

  const handleRollFinish = (card: BonusCardData) => {
    // TODO: add card to player cards
    setNextTurnState();
  };

  const handleSubmitReview = () => {
    setNextTurnState();
  };

  return (
    <div className="absolute inset-0 [&>*]:pointer-events-auto pointer-events-none z-50 overflow-hidden">
      <div className="absolute top-3 left-4 !pointer-events-none">
        <PlayersList />
      </div>

      <div className="absolute right-4 top-3 w-[15rem]">
        <div className="text-[#494949] font-wide-black text-sm pb-3 text-end">
          <Countdown />
        </div>
        <div className="pb-8">
          <QuickMenu />
        </div>
        <Notifications />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {turnState === "rolling-dice" && !isPlayerMoving && <MoveButton />}
        {turnState === "choosing-train-ride" && !isPlayerMoving && <TrainMoveDialog />}
        {turnState === "filling-game-review" && (
          <GameReviewForm onSubmit={handleSubmitReview} />
        )}
        {turnState === "rolling-bonus-card" && (
          <RollDeckCard onRollFinish={handleRollFinish} />
        )}
        #{myPlayer?.current_position} ход: {turnState}
      </div>
    </div>
  );
}

export default UI;
