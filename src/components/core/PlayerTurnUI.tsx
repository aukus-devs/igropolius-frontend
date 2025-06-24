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
    case null:
      return null;
    case "rolling-dice":
      return <MoveButton />;
    case "choosing-train-ride":
      return <TrainMoveDialog />;
    case "filling-game-review":
      return <GameReviewForm />;
    case "rolling-bonus-card":
      return <RollBonusCard />;
    case "using-dice-bonuses":
      return null;
    case "using-street-tax-bonuses":
      return null;
    case "using-reroll-bonuses":
      return null;
    case "using-prison-bonuses":
      return null;
    case "using-map-tax-bonuses":
      return null;
    case "stealing-bonus-card":
      return null; // No UI for stealing bonus card, handled in PlayerCards
    case "using-map-tax-bonuses-after-train-ride":
      return null;
    case "choosing-building-sector":
      return null;
    case "entering-prison":
      return null;
    default: {
      const error: never = turnState;
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
