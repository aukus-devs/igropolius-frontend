import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsTab from "./ReviewsTab";
import { GameReviewType, PlayerEvent } from "@/lib/types";
import CardsTab from "./CardsTab";
import ArchiveTab from "./ArchiveTab";
import EventsTab from "./EventsTab";

type Props = {
  reviews: GameReviewType[];
  events: PlayerEvent[];
};

function PlayerDialogTabs({ reviews, events }: Props) {
  const tabs = [
    { name: "Ходы", value: "events", content: <EventsTab events={events} /> },
    { name: "Игры", value: "games", content: <ReviewsTab reviews={reviews} /> },
    { name: "Карточки", value: "cards", content: <CardsTab /> },
    { name: "Архив чеков", value: "archive", content: <ArchiveTab /> },
  ];

  return (
    <Tabs className="px-5" defaultValue={tabs[0].value}>
      <TabsList className="w-full bg-transparent gap-2">
        {tabs.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground bg-foreground/20 rounded-lg hover:text-foreground transition-colors data-[state=active]:text-primary-foreground data-[state=active]:bg-primary h-8 font-roboto-wide-semibold"
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
