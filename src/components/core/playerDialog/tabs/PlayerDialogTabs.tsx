import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GamesTab from './GamesTab';
import CardsTab from './CardsTab';
import EventsTab from './EventsTab';
import { PlayerDetails } from '@/lib/api-types-generated';

type Props = {
  player: PlayerDetails;
};

function PlayerDialogTabs({ player }: Props) {
  const tabs = [
    { name: 'Игры', value: 'games', content: <GamesTab player={player} /> },
    { name: 'Карточки', value: 'cards', content: <CardsTab cards={player.bonus_cards} /> },
    { name: 'Действия', value: 'actions', content: <EventsTab player={player} /> },
  ];

  return (
    <Tabs className="md:px-0 px-[15px]" defaultValue={tabs[0].value}>
      <TabsList className="md:p-5 w-full bg-[#81A772]/10 backdrop-blur-md gap-2 p-0 sticky top-0 z-50">
        {tabs.map(({ name, value }) => (
          <TabsTrigger
            key={value}
            className="text-muted-foreground bg-[#575b58] rounded-xl hover:text-foreground transition-colors data-[state=active]:text-primary-foreground data-[state=active]:bg-primary h-8 font-roboto-wide-semibold"
            value={value}
          >
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, content }) => (
        <TabsContent key={value} value={value} className="z-10 px-5">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default PlayerDialogTabs;
