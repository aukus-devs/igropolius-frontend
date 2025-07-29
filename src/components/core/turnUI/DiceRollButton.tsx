import { Button } from '@/components/ui/button';
import { makePlayerMove } from '@/lib/api';
import { SectorsById } from '@/lib/mockData';
import useDiceStore from '@/stores/diceStore';
import usePlayerStore from '@/stores/playerStore';
import useSystemStore from '@/stores/systemStore';
import { useMutation } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';

export function DiceRollButton() {
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
    await rollDice();
    if (canModifyRoll) {
      await setNextTurnState({});
      return;
    }

    console.log('flag 1');
    useSystemStore.setState(state => ({ ...state, disablePlayersQuery: true }));
    usePlayerStore.setState(state => ({ ...state, isPlayerMoving: true }));

    // skip state for using movement bonuses
    await setNextTurnState({});

    console.log('flag 2');

    const { new_sector_id, map_completed } = await makePlayerMove({
      type: 'dice-roll',
      selected_die: null,
      adjust_by_1: null,
      ride_train: false,
    });

    // switch to next state and start animation
    await setNextTurnState({
      sectorToId: new_sector_id,
      action: 'skip-bonus',
      mapCompleted: map_completed,
    });

    console.log('flag 3');

    // animate movement
    await moveMyPlayer({
      sectorTo: new_sector_id,
    });

    usePlayerStore.setState(state => ({ ...state, isPlayerMoving: false }));
    useSystemStore.setState(state => ({ ...state, disablePlayersQuery: false }));
  };

  const { isPending, mutateAsync: doHandleClick } = useMutation({
    mutationFn: handleClick,
  });

  return (
    <Button variant="outline" onClick={() => doHandleClick()} loading={isPlayerMoving || isPending}>
      Бросить кубик и ходить
    </Button>
  );
}
