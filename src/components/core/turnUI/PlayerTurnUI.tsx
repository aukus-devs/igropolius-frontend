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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoseCardOnDropDialog from './LoseCardOnDropDialog';
import PrisonEnterCardRoll from './PrisonEnterCardRoll';
import GameRerollDialog from './GameRerollDialog';
import SelectBuildingSectorDialog from './SelectingBuildingSectorDialog';

export default function PlayerTurnUI() {
  const { turnState, isPlayerMoving, playersHaveNoCards, prisonHasNoCards, myPlayerHasNoCards } =
    usePlayerStore(
      useShallow(state => {
        const hasAnyCards = state.players.some(
          player => player.id !== state.myPlayerId && player.bonus_cards.length > 0
        );
        return {
          turnState: state.turnState,
          isPlayerMoving: state.isPlayerMoving,
          playersHaveNoCards: !hasAnyCards,
          myPlayerHasNoCards: (state.myPlayer?.bonus_cards.length ?? 0) === 0,
          prisonHasNoCards: state.prisonCards.length === 0,
        };
      })
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
      return <GameRerollDialog />;
    case 'using-prison-bonuses':
      return <SkipPrisonDialog />;
    case 'using-map-tax-bonuses':
      return <SkipMapTaxDialog />;
    case 'using-map-tax-bonuses-after-train-ride':
      return <SkipMapTaxDialog />;
    case 'stealing-bonus-card':
      if (playersHaveNoCards) {
        return <NoCardsToStealDialog />;
      }
      return null; // No UI for stealing bonus card, handled in PlayerCards
    case 'choosing-building-sector':
      return <SelectBuildingSectorDialog />;
    case 'entering-prison':
      if (myPlayerHasNoCards && prisonHasNoCards) {
        return <NoCardsForPrisonDialog />;
      }
      return <PrisonEnterCardRoll />;
    case 'drop-random-card-in-prison':
      return <LoseCardOnDropDialog />;
    case 'receive-card-from-prison':
      return <RollBonusCard />;
    case 'drop-random-card':
      return <LoseCardOnDropDialog />;
    default: {
      const error: never = turnState;
      throw new Error(`Unknown turn state: ${error}`);
    }
  }
}

function NoCardsToStealDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Сейчас у игроков нет карточек для воровства</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => setNextTurnState({})}
        >
          Продолжить
        </Button>
      </div>
    </Card>
  );
}

function NoCardsForPrisonDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Нет карточек для ролла в тюрьме</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => setNextTurnState({})}
        >
          Продолжить
        </Button>
      </div>
    </Card>
  );
}
