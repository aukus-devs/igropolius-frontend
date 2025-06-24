import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";
import TrainMoveDialog from "./TrainMoveDialog";
import GameReviewForm from "./GameReviewForm";
import RollBonusCard from "./RollBonusCard";
import { Button } from "../ui/button";

export default function PlayerTurnUI() {
  const { turnState, isPlayerMoving } = usePlayerStore(
    useShallow((state) => ({
      turnState: state.turnState,
      isPlayerMoving: state.isPlayerMoving,
    })),
  );

  const disableUI = isPlayerMoving;
  if (disableUI) {
    return null; // Don't render anything if the player is moving
  }

  switch (turnState) {
    case "rolling-dice":
      return <MoveButton />;
    case "choosing-train-ride":
      return <TrainMoveDialog />;
    case "filling-game-review":
      return <GameReviewForm />;
    case "rolling-bonus-card":
      return <RollBonusCard />;
    default: {
      const error = turnState;
      throw new Error(`Unknown turn state: ${error}`);
    }
  }
}

function MoveButton() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  return (
    <Button variant="outline" onClick={moveMyPlayer} disabled={isPlayerMoving}>
      Бросить кубик и ходить
    </Button>
  );
}
