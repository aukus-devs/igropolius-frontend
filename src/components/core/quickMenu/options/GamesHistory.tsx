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

export default function GamesHistory({ className }: { className?: string }) {
  const { pathActive, activate } = useUrlPath('/history');

  return (
    <Dialog open={pathActive} onOpenChange={activate}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }), className)}>
        История игр
      </DialogTrigger>
      <DialogContent
        className="m:max-w-[600px] h-[90vh] max-h-[660px] flex flex-col p-0"
        aria-describedby=""
      >
        {/*<ScrollArea className="h-full w-full rounded-md">*/}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="px-5 pb-10">
            <DialogHeader className="pt-5 pb-4">
              <DialogTitle className="text-[32px] font-wide-black leading-[38px]">
                История игр с прошлых ивентов
              </DialogTitle>
            </DialogHeader>
            <GamesHistoryContent />
          </div>
        </div>
        {/*</ScrollArea>*/}
      </DialogContent>
    </Dialog>
  );
}
