import RulesTabs from "@/components/core/rules/RulesTabs";
import { ScrollArea } from "@/components/ui/scroll-area";

function RulesTab() {
  return (
    <div className="h-[calc(100vh-52px)] bg-background">
      <ScrollArea className="h-full w-full overflow-auto">
        <div className="w-full px-5 pt-5">
          <div className="flex flex-col font-wide-black text-[2rem]">
            Правила <span className="text-primary">Игрополиуса</span>
          </div>
        </div>
        <div className="mt-[30px] px-5">
          <RulesTabs />
        </div>
      </ScrollArea>
    </div>
  )
}

export default RulesTab;
