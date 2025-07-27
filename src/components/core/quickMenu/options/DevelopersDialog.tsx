import { buttonVariants } from '../../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreditsData } from '@/lib/mockData';
import { Users } from '@/components/icons';

type Props = {
  className?: string;
};

export default function AboutDialog({ className }: Props) {
  return (
    <Dialog>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <Users />
        Разработчики
      </DialogTrigger>
      <DialogContent className="w-[600px] p-0" aria-describedby="">
        <ScrollArea className="max-h-[700px] px-5">
          <DialogHeader className="pt-5">
            <DialogTitle className="text-[32px] font-wide-black">
              Команда разработки <span className="text-primary">Игрополиуса</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pb-5">
            <div className="flex gap-2 flex-col">
              <div className="mt-[30px] text-xl font-wide-black">Программирование</div>
              {CreditsData.developers.map((dev, index) => (
                <div key={index} className="text-base font-wide-medium">{dev}</div>
              ))}
            </div>
            <div className="flex gap-2 flex-col">
              <div className="mt-[50px] text-xl font-wide-black">Дизайн</div>
              {CreditsData.designers.map((dev, index) => (
                <div key={index} className="text-base font-wide-medium">{dev}</div>
              ))}
            </div>
            {/* <div className="mt-[50px] text-xl font-wide-black">Тестирование</div> */}
            <div className="mt-[50px] text-xl font-wide-black">Идеи</div>
            <div className="mt-[10px]">Praden</div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
