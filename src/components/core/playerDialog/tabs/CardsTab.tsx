import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cardTypes, frontendCardsData } from '@/lib/mockData';
import { ActiveBonusCard, BonusCardType } from '@/lib/types';

type GameCardProps = {
  type: BonusCardType;
  inactive?: boolean;
};

function GameCard({ type, inactive }: GameCardProps) {
  const cardData = frontendCardsData[type];
  
  return (
    <div
      className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] bg-primary text-primary-foreground rounded-xl data-[inactive=true]:pointer-events-none data-[inactive=true]:grayscale-100"
      data-inactive={inactive}
    >
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
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function CardsTab({ cards }: { cards: ActiveBonusCard[] }) {
  const availableCards = cardTypes.filter(type => cards.some(card => card.bonus_type === type));
  const unavailableCards = cardTypes.filter(type => !availableCards.includes(type));

  return (
    <div className="flex flex-col my-5">
      {availableCards.length > 0 && (
        <div className="flex flex-wrap gap-y-2.5 gap-x-2 mb-[50px] justify-center">
          {availableCards.map(type => (
            <GameCard key={type} type={type} />
          ))}
        </div>
      )}

      {unavailableCards.length > 0 && (
        <>
          <p className="text-center text-xs font-wide-semibold text-muted-foreground mb-5">
            Не полученые
          </p>
          <div className="flex flex-wrap gap-y-2.5 gap-x-2 justify-center">
            {unavailableCards.map(type => (
              <GameCard key={type} type={type} inactive />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CardsTab;
