import RulesTabs from '@/components/core/rules/RulesTabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef } from 'react';

function RulesTab() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea className="h-dvh w-full overflow-auto bg-background pt-15" ref={scrollAreaRef}>
      <div className="w-full px-4 pt-[40px]">
        <p className="flex flex-col font-wide-black text-[2rem]">
          Правила <span className="text-primary">Игрополиуса</span>
        </p>
      </div>
      <RulesTabs scrollAreaRef={scrollAreaRef} />
    </ScrollArea>
  );
}

export default RulesTab;
