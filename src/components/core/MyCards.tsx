import usePlayerStore from '@/stores/playerStore';
import { Card } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { frontendCardsData } from '@/lib/mockData';

export default function MyCards() {
  const cards = usePlayerStore(state => state.myPlayer?.bonus_cards ?? []);
  const canBeUsed = true;

  return (
    <Card className="p-2 gap-2" style={{ width: '300px' }}>
      <span>Мои карточки</span>
      <div className="flex flex-wrap gap-2 ">
        {cards.map(card => {
          const cardData = frontendCardsData[card.bonus_type];
          return (
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="flex w-[32px] h-[45px] rounded-sm overflow-hidden">
                <img src={cardData.picture} />
              </TooltipTrigger>
              <TooltipContent
                className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3"
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <div className="text-[20px] font-semibold mb-2">{cardData.name}</div>
                <div className="text-base font-semibold text-muted-foreground">
                  {cardData.description}
                </div>
                {canBeUsed && (
                  <div className="mt-2 w-full">
                    <Button className="w-full" onClick={() => {}}>
                      Использовать
                    </Button>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
