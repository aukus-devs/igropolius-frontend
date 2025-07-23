import { Button } from '@/components/ui/button';
import { SectorsById } from '@/lib/mockData';
import useDiceStore from '@/stores/diceStore';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export function MoveButton() {
  const { isPlayerMoving, moveMyPlayer, myPlayer, setNextTurnState } = usePlayerStore(
    useShallow(state => ({
      isPlayerMoving: state.isPlayerMoving,
      moveMyPlayer: state.moveMyPlayer,
      myPlayer: state.myPlayer,
      setNextTurnState: state.setNextTurnState,
    }))
  );
  const rollDice = useDiceStore(state => state.rollDice);

  const playerCards = myPlayer?.bonus_cards || [];
  const hasRollCards = playerCards.some(
    card => card.bonus_type === 'adjust-roll-by1' || card.bonus_type === 'choose-1-die'
  );
  const canRideTrain = myPlayer?.sector_id && SectorsById[myPlayer.sector_id].type === 'railroad';
  const canModifyRoll = canRideTrain || hasRollCards;

  const handleClick = async () => {
    const roll = await rollDice();
    if (canModifyRoll) {
      await setNextTurnState({
        prevSectorId: myPlayer?.sector_id,
      });
      return;
    }

    await setNextTurnState({
      prevSectorId: myPlayer?.sector_id,
    });

    const total = roll.reduce((sum, value) => sum + value, 0);
    moveMyPlayer({
      totalRoll: total,
      adjustBy1: null,
      selectedDie: null,
      action: 'skip-bonus',
    });
  };

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPlayerMoving}>
      Бросить кубик и ходить
    </Button>
  );
}
