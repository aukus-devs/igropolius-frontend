import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import useUrlPath from '@/hooks/useUrlPath';
import { cn } from '@/lib/utils';
import GamesHistoryContent from './GamesHistoryContent';
import SvgGame from '@/components/icons/Game';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GamesHistory({ className }: { className?: string }) {
  const { pathActive, activate } = useUrlPath('/history');

  return (
    <Dialog open={pathActive} onOpenChange={activate}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        <SvgGame />
        История игр
      </DialogTrigger>
      <DialogContent className="max-w-[600px] h-[780px] p-0" aria-describedby="">
        <ScrollArea className="h-full w-full overflow-auto">
          <DialogHeader className="pt-5 px-5 mb-[20px]">
            <DialogTitle className="text-[32px] font-wide-black leading-[38px]">
              История игр с прошлых ивентов
            </DialogTitle>
          </DialogHeader>
          <div className="pb-20">
            <GamesHistoryContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
