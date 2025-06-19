import RulesTabs from "@/components/core/rules/RulesTabs";
import { ScrollArea } from "@/components/ui/scroll-area";

function RulesTab() {
  return (
    <ScrollArea className="h-dvh w-full overflow-auto bg-background">
      <div className="w-full px-4 pt-[110px]">
        <p className="flex flex-col font-wide-black text-[2rem]">
          Правила <span className="text-primary">Игрополиуса</span>
        </p>
      </div>
      <div className="mt-[30px] px-5">
        <RulesTabs />
      </div>
    </ScrollArea>
  )
}

export default RulesTab;
