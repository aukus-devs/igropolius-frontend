import { Button } from "@/components/ui/button";
import usePlayerStore from "@/stores/playerStore";

export function MoveButton() {
  const moveMyPlayer = usePlayerStore((state) => state.moveMyPlayer);
  const isPlayerMoving = usePlayerStore((state) => state.isPlayerMoving);

  return (
    <Button variant="outline" onClick={moveMyPlayer} disabled={isPlayerMoving}>
      Бросить кубик и ходить
    </Button>
  );
}
