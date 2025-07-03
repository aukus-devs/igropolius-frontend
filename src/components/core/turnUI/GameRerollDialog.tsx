import { Button } from '@/components/ui/button';
import usePlayerStore from '@/stores/playerStore';

export default function GameRerollDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);

  return (
    <div className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4 font-semibold">
      Тут будет возможность реролла игры
      <Button onClick={() => setNextTurnState({ action: 'skip-bonus' })}>Пропустить</Button>
    </div>
  );
}
