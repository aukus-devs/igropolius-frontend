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
      <DialogContent
        className="m:max-w-[600px] h-[90vh] max-h-[660px] flex flex-col p-0"
        aria-describedby=""
      >
        <ScrollArea className="flex h-full flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-5 pb-20">
            <DialogHeader className="pt-5 pb-4">
              <DialogTitle className="text-[32px] font-wide-black leading-[38px]">
                История игр с прошлых ивентов
              </DialogTitle>
            </DialogHeader>
            <GamesHistoryContent />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
