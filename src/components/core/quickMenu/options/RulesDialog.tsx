import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import RulesTabs from '../../rules/RulesTabs';
import { Document } from '@/components/icons';
import useUrlPath from '@/hooks/useUrlPath';

function RulesDialog({ className }: { className?: string }) {
  const { activate, pathActive } = useUrlPath('/rules');

  return (
    <Dialog open={pathActive} onOpenChange={activate}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Document className="h-4 w-4" />
          Правила
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-3xl h-[41.25rem] p-0" aria-describedby="">
        <ScrollArea className="h-full w-full overflow-auto">
          <DialogHeader className="w-full px-5 pt-5">
            <DialogTitle className="flex flex-col font-wide-black text-[2rem]">
              Правила <span className="text-primary">Игрополиуса</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-[30px] px-5 mb-20">
            <RulesTabs />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RulesDialog;
