import RulesTabs from "@/components/core/rules/RulesTabs";
import { ScrollArea } from "@/components/ui/scroll-area";

function RulesTab() {
  return (
    <div className="h-dvh pt-[110px] bg-background">
      <ScrollArea className="h-full w-full overflow-auto">
        <div className="w-full px-4">
          <p className="flex flex-col font-wide-black text-[2rem]">
            Правила <span className="text-primary">Игрополиуса</span>
          </p>
        </div>
        <div className="mt-[30px] px-5">
          <RulesTabs />
        </div>
      </ScrollArea>
    </div>
  )
}

export default RulesTab;
