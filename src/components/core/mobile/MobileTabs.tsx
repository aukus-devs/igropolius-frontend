import { HomeIcon, Rows3Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapTab from "./tabs/MapTab";
import RulesTab from "./tabs/RulesTab";

function MobileTabs() {
  const tabs = [
    { icon: <HomeIcon />, value: "map", content: <MapTab /> },
    { icon: <Rows3Icon />, value: "rules", content: <RulesTab /> },
  ];

  return (
    <Tabs className="gap-0" defaultValue={tabs[0].value}>
      <TabsList className="w-full gap-2 p-[15px] h-auto rounded-none bg-transparent fixed top-0 z-50">
        {tabs.map(({ icon, value }) => (
          <TabsTrigger
            key={value}
            className="bg-[#1C1C1C] text-muted-foreground rounded-[10px] hover:text-foreground transition-colors data-[state=active]:text-primary-foreground h-11 font-roboto-wide-semibold [&_svg:not([class*='size-'])]:size-6 data-[state=active]:bg-primary"
            value={value}
          >
            {icon}
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

export default MobileTabs;
