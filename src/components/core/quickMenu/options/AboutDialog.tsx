import { useEffect, useState } from 'react';
import { buttonVariants } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import { ScrollArea } from '@/components/ui/scroll-area';

type Props = {
  className?: string;
};

export default function AboutDialog({ className }: Props) {
  const { value: firstTimeVisit, save: saveFirstTimeVisit } = useLocalStorage({
    key: 'first-time-visit',
    defaultValue: true,
  });
  const [isOpen, setIsOpen] = useState(firstTimeVisit ? true : false);

  useEffect(() => {
    saveFirstTimeVisit(false);
  }, [saveFirstTimeVisit]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <InfoIcon />
        Об ивенте
      </DialogTrigger>
      <DialogContent className="w-[37.5rem]" aria-describedby="">
        <ScrollArea className="overflow-auto h-[30rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Об ивенте</DialogTitle>
          </DialogHeader>
          Игрополис — это увлекательный ивент, где популярные стримеры соревнуются друг с другом,
          проходя различные игры. Каждый участник бросает кубик, чтобы сделать ход по специальной
          игровой карте, выполняет задания и стремится первым достичь финиша.
          <br />
          <br />
          Побеждает тот, кто проявит ловкость, смекалку и удачу, чтобы обойти соперников и стать
          чемпионом Игрополиса!
          <div className="mt-20 mb-[30px] text-3xl font-wide-semibold">
            Команда разработки Игрополиуса
          </div>
          <div className="mt-[50px] text-xl font-wide-semibold">Программирование</div>
          <div className="mt-[50px] text-xl font-wide-semibold">Дизайн</div>
          <div className="mt-[50px] text-xl font-wide-semibold">Тестирование</div>
          <div className="mt-[50px] text-xl font-wide-semibold">Идеи</div>
          <div className="mt-[10px]">Praden</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
