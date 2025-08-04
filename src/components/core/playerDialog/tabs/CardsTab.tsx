import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ActiveBonusCard, MainBonusCardType } from '@/lib/api-types-generated';
import { mainCardTypes, frontendCardsData } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useRef } from 'react';
import ImageLoader from '../../ImageLoader';

type GameCardProps = {
  type: MainBonusCardType;
  inactive?: boolean;
};

function GameCard({ type, inactive }: GameCardProps) {
  const cardData = frontendCardsData[type];
  const isMobile = useIsMobile();
  const [showDescription, setShowDescription] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (showDescription) {
        setShowDescription(false);
      }
    };

    if (isMobile) {
      document.addEventListener('scroll', handleScroll, { passive: true });
      return () => document.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile, showDescription]);

  const handleCardClick = () => {
    if (isMobile) {
      setShowDescription(!showDescription);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowDescription(false);
    }
  };

  if (isMobile) {
    return (
      <div className="relative">
        <div
          ref={cardRef}
          className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl data-[inactive=true]:grayscale-100 cursor-pointer"
          data-inactive={inactive}
          onClick={handleCardClick}
        >
          <ImageLoader
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] rounded-xl overflow-hidden"
            src={cardData.picture}
            alt={cardData.name}
          />
        </div>
        {showDescription && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-card/95 backdrop-blur-[1.5rem] p-4 rounded-lg border shadow-lg w-full max-w-sm">
              <div className="text-[16px] font-semibold mb-2">{cardData.name}</div>
              <div className="text-sm font-semibold text-muted-foreground">
                {cardData.description}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl data-[inactive=true]:grayscale-100"
      data-inactive={inactive}
    >
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger>
          <ImageLoader
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] rounded-xl overflow-hidden"
            src={cardData.picture}
            alt={cardData.name}
          />
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3"
          side="right"
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
  const availableCards = mainCardTypes.filter(type => cards.some(card => card.bonus_type === type));
  const unavailableCards = mainCardTypes.filter(type => !availableCards.includes(type));

  return (
    <div className="flex flex-col my-5">
      {availableCards.length > 0 && (
        <div className="flex flex-wrap gap-y-2.5 gap-x-2 mb-[50px]">
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
          <div className="flex flex-wrap gap-y-2.5 gap-x-2">
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
