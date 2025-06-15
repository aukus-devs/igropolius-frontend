import { HomeIcon, Rows3Icon, UsersRoundIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapTab from "./tabs/MapTab";
import PlayersTab from "./tabs/PlayersTab";
import RulesTab from "./tabs/RulesTab";

function MobileTabs() {
  const tabs = [
    { icon: <HomeIcon />, value: "map", content: <MapTab /> },
    { icon: <UsersRoundIcon />, value: "players", content: <PlayersTab /> },
    { icon: <Rows3Icon />, value: "rules", content: <RulesTab /> },
  ];

  return (
    <Tabs defaultValue={tabs[0].value}>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>
          {content}
        </TabsContent>
      ))}
      <TabsList className="w-full gap-2 px-2 py-2 h-auto rounded-t-[10px] rounded-b-none bg-background fixed bottom-0">
        {tabs.map(({ icon, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground rounded-[10px] hover:text-foreground transition-colors data-[state=active]:text-primary-foreground h-11 font-roboto-wide-semibold [&_svg:not([class*='size-'])]:size-6 data-[state=active]:bg-primary"
            value={value}
          >
            {icon}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default MobileTabs;
