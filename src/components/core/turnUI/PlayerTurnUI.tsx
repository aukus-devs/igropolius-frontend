import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import TrainMoveDialog from './TrainMoveDialog';
import GameReviewForm from './GameReviewForm';
import RollBonusCard from './RollBonusCard';
import DiceBonusesDialog from './DiceBonusesDialog';
import { MoveButton } from './MoveButton';
import SkipStreetTaxDialog from './SkipStreetTaxDialog';
import SkipMapTaxDialog from './SkipMapTaxDialog';
import SkipPrisonDialog from './SkipPrisonDialog';

export default function PlayerTurnUI() {
  const { turnState, isPlayerMoving } = usePlayerStore(
    useShallow(state => ({
      turnState: state.turnState,
      isPlayerMoving: state.isPlayerMoving,
    }))
  );

  const disableUI = isPlayerMoving;
  if (disableUI) {
    return null; // Don't render anything if the player is moving
  }

  switch (turnState) {
    case null:
      return null;
    case 'rolling-dice':
      return <MoveButton />;
    case 'choosing-train-ride':
      return <TrainMoveDialog />;
    case 'filling-game-review':
      return <GameReviewForm />;
    case 'rolling-bonus-card':
      return <RollBonusCard />;
    case 'using-dice-bonuses':
      return <DiceBonusesDialog />;
    case 'using-street-tax-bonuses':
      return <SkipStreetTaxDialog />;
    case 'using-reroll-bonuses':
      return null;
    case 'using-prison-bonuses':
      return <SkipPrisonDialog />;
    case 'using-map-tax-bonuses':
      return <SkipMapTaxDialog />;
    case 'using-map-tax-bonuses-after-train-ride':
      return <SkipMapTaxDialog />;
    case 'stealing-bonus-card':
      return null; // No UI for stealing bonus card, handled in PlayerCards
    case 'choosing-building-sector':
      return null;
    case 'entering-prison':
      return null;
    default: {
      const error: never = turnState;
      throw new Error(`Unknown turn state: ${error}`);
    }
  }
}
