import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsTab from "./ReviewsTab";
import { GameReviewType } from "@/types";
import CardsTab from "./CardsTab";
import ArchiveTab from "./ArchiveTab";

type Props = {
  reviews: GameReviewType[];
}

function PlayerDialogTabs({ reviews }: Props) {
  const tabs = [
    { name: "Игры", value: "games", content: <ReviewsTab reviews={reviews} /> },
    { name: "Карточки", value: "cards", content: <CardsTab /> },
    { name: "Архив чеков", value: "archive", content: <ArchiveTab /> },
  ];

  return (
    <Tabs defaultValue={tabs[0].value}>
      <TabsList className="w-full bg-transparent gap-2 bg-8">
        {tabs.map(({ name, value }) => (
          <TabsTrigger key={value} className="text-muted-foreground bg-foreground/20 rounded-lg hover:text-foreground transition-colors data-[state=active]:text-foreground data-[state=active]:bg-primary-foreground h-8" value={value}>
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value}>{content}</TabsContent>
      ))}
    </Tabs>
  )
}

export default PlayerDialogTabs;
