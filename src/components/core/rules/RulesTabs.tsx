import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Rules from "./Rules";
import RulesChanges from "./RulesChanges";

export default function RulesTabs() {
  const tabs = [
    { name: "Правила", value: "rules", content: <Rules /> },
    { name: "Изменения", value: "changelog", content: <RulesChanges /> },
  ];
  return (
    <Tabs defaultValue={tabs[0].value}>
      <TabsList className="w-full bg-transparent gap-2 p-0">
        {tabs.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground bg-foreground/20 rounded-xl hover:text-foreground transition-colors data-[state=active]:text-primary-foreground data-[state=active]:bg-primary h-8 font-roboto-wide-semibold"
            value={value}
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
