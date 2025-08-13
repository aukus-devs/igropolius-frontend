import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import GamesHistoryContent from '../quickMenu/options/GamesHistoryContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from '@/components/icons';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlayerFilter?: string;
  initialSearchFilter?: string;
};

export default function GamesHistoryDialog({
  children,
  open,
  onOpenChange,
  initialPlayerFilter,
  initialSearchFilter,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="flex flex-col gap-8 h-[calc(100dvh_-_74px)] left-0 bottom-0 w-screen md:w-[600px] p-0"
        aria-describedby=""
      >
        <DialogClose
          className={cn(
            buttonVariants(),
            'absolute -top-[74px] left-[15px] rounded-[10px] h-11 mt-[15px] mx-auto md:hidden'
          )}
        >
          <ArrowLeft />
          <span>Назад</span>
        </DialogClose>
        <ScrollArea className="h-full w-full overflow-auto">
          <DialogHeader className="pt-5 px-5 mb-[20px]">
            <DialogTitle className="text-[32px] font-wide-black leading-[38px]">
              История игр с прошлых ивентов
            </DialogTitle>
          </DialogHeader>
          <div className="pb-20">
            <GamesHistoryContent
              initialPlayerFilter={initialPlayerFilter}
              initialSearchFilter={initialSearchFilter}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
