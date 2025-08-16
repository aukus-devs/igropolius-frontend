import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GamesTab from './GamesTab';
import CardsTab from './CardsTab';
import EventsTab from './EventsTab';
import { PlayerDetails } from '@/lib/api-types-generated';
import useScrollStyler from '@/hooks/useScrollStyler';
import { RefObject } from 'react';

type Props = {
  player: PlayerDetails;
  scrollAreaRef?: RefObject<HTMLDivElement | null>;
};

function PlayerDialogTabs({ player, scrollAreaRef }: Props) {
  const tabs = [
    { name: 'Игры', value: 'games', content: <GamesTab player={player} /> },
    {
      name: 'Бонусы',
      value: 'cards',
      content: (
        <CardsTab cards={player.bonus_cards} buildingBonus={player.building_upgrade_bonus} />
      ),
    },
    { name: 'Действия', value: 'actions', content: <EventsTab player={player} /> },
  ];

  const { onRender, style, stuck } = useScrollStyler();

  const handleTabChange = () => {
    if (scrollAreaRef?.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (viewport) {
        viewport.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (stuck) {
    style.borderTopRightRadius = style.borderRadius;
    style.borderTopLeftRadius = style.borderRadius;
    style.borderBottomLeftRadius = 0;
    style.borderBottomRightRadius = 0;
  }

  return (
    <Tabs
      className="md:px-0 px-[15px] gap-0"
      defaultValue={tabs[0].value}
      onValueChange={handleTabChange}
    >
      <TabsList className="md:p-5 w-full  gap-2 p-0 sticky top-0 z-50" style={style} ref={onRender}>
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
        <TabsContent key={value} value={value} className="z-10 mb-30">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default PlayerDialogTabs;
