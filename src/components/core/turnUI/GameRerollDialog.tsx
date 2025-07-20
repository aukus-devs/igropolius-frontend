import { Button } from '@/components/ui/button';
import { DialogContent } from '@/components/ui/dialog';
import { Dialog } from '@radix-ui/react-dialog';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GameRerollDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-[1.5rem] bg-card/70 border-none rounded-xl p-4 font-semibold w-[400px]">
        <div className="flex flex-col gap-5 items-center justify-center">
          Использована карточка реролла игры
          <Button className="w-[300px]" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
