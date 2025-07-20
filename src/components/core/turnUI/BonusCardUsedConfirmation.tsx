import { Button } from '@/components/ui/button';
import { DialogContent } from '@/components/ui/dialog';
import { ManualUseCard } from '@/lib/types';
import { Dialog } from '@radix-ui/react-dialog';

type Props = {
  card: ManualUseCard;
  onClose: () => void;
};

export default function BonusCardUsedConfirmation({ card, onClose }: Props) {
  return (
    <Dialog open>
      <DialogContent className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4 font-semibold w-[400px]">
        <div className="flex flex-col gap-5 items-center justify-center">
          {card === 'reroll-game' && <p>Использована карточка реролла игры</p>}
          {card === 'game-help-allowed' && <p>Использована карточка помощи в игре</p>}
          <Button className="w-[300px]" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
