import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GamesTab from "./GamesTab";
import CardsTab from "./CardsTab";
import EventsTab from "./EventsTab";
import { PlayerData } from "@/lib/types";
import { mockReviews } from "@/lib/mockData";

type Props = {
  player: PlayerData;
};

function PlayerDialogTabs({ player }: Props) {
  const tabs = [
    { name: "Игры", value: "games", content: <GamesTab games={mockReviews} /> },
    { name: "Карточки", value: "cards", content: <CardsTab cards={player.bonus_cards} /> },
    { name: "Действия", value: "actions", content: <EventsTab player={player} /> },
  ];

  return (
    <Tabs className="px-5" defaultValue={tabs[0].value}>
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

export default PlayerDialogTabs;
