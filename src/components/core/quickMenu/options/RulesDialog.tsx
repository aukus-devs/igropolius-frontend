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
import useRules from '@/hooks/useRules';
import { formatTsToFullDate } from '@/lib/utils';

function RulesDialog({ className }: { className?: string }) {
  const { activate, pathActive } = useUrlPath('/rules');

  const { rules } = useRules();
  const createdTime = rules?.created_at ? formatTsToFullDate(rules.created_at) : null;

  return (
    <Dialog open={pathActive} onOpenChange={activate}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Document className="h-4 w-4" />
          Правила
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[90dvh] h-auto p-0" aria-describedby="">
        <ScrollArea className="h-full w-full overflow-auto">
          <DialogHeader className="w-full px-5 pt-5 relative">
            <DialogTitle className="flex flex-col font-wide-black text-[2rem]">
              Правила <span className="text-primary">Игрополиуса</span>
            </DialogTitle>
            <div className="absolute right-[20px] top-[20px] text-sm text-[#9F9F9F]">
              {createdTime && <span>от {createdTime}</span>}
            </div>
          </DialogHeader>
          <div className="mt-[30px] mb-20">
            <RulesTabs />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default RulesDialog;
