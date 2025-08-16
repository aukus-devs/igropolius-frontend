import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MainBonusCardType, PlayerDetails } from '@/lib/api-types-generated';
import { mainCardTypes, frontendCardsData } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useRef } from 'react';
import ImageLoader from '../../ImageLoader';
import { getCardDescription } from '@/lib/utils';
import { SCORE_BONUS_PER_MAP_COMPLETION } from '@/lib/constants';

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
                {getCardDescription(cardData)}
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
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
          side="right"
          align="start"
          sideOffset={8}
        >
          <div className="text-[20px] font-semibold mb-2 leading-6">{cardData.name}</div>
          <div className="text-base font-semibold text-muted-foreground leading-[19px]">
            {getCardDescription(cardData)}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function CardsTab({ player }: { player: PlayerDetails }) {
  const { bonus_cards: cards, building_upgrade_bonus: buildingBonus } = player;

  const availableCards = mainCardTypes.filter(type => cards.some(card => card.bonus_type === type));
  const unavailableCards = mainCardTypes.filter(type => !availableCards.includes(type));

  const mapBonus = player.maps_completed * SCORE_BONUS_PER_MAP_COMPLETION;

  const showAvailableSection = availableCards.length > 0 || Boolean(buildingBonus) || mapBonus > 0;

  return (
    <div className="flex flex-col md:my-0 my-5 md:px-5">
      {showAvailableSection && (
        <div className="flex flex-wrap gap-y-2.5 gap-x-2 mb-[50px]">
          {availableCards.map(type => (
            <GameCard key={type} type={type} />
          ))}
          <BuildingBonusCard buildingBonus={buildingBonus} />
          <MapScoreBonusCard mapBonus={mapBonus} />
        </div>
      )}

      {unavailableCards.length > 0 && (
        <>
          <p className="text-center text-xs font-roboto-wide-semibold text-muted-foreground mb-5">
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

function BuildingBonusCard({ buildingBonus }: { buildingBonus?: number }) {
  const isMobile = useIsMobile();
  const [showDescription, setShowDescription] = useState(false);

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

  if (!buildingBonus) {
    return null;
  }

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
          className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl cursor-pointer"
          onClick={handleCardClick}
        >
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl overflow-hidden data-[positive=true]:bg-green-500 bg-red-500 justify-center items-center text-4xl"
            data-positive={buildingBonus > 0}
          >
            {buildingBonus > 0 && '+'}
            {buildingBonus}
          </div>
        </div>
        {showDescription && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-card/95 backdrop-blur-[1.5rem] p-4 rounded-lg border shadow-lg w-full max-w-sm">
              <div className="text-[16px] font-semibold mb-2">Бонус зданий</div>
              <div className="text-sm font-semibold text-muted-foreground">
                Автоматически увеличивает или уменьшает размер следующего здания
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl">
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger>
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl  data-[positive=true]:bg-green-500 bg-red-500 justify-center text-4xl"
            data-positive={buildingBonus > 0}
          >
            <div>
              <div className="text-xl mt-4 mb-4">Бонус зданий</div>
              {buildingBonus > 0 && '+'}
              {buildingBonus}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
          side="right"
          align="start"
          sideOffset={8}
        >
          <div className="text-[20px] font-semibold mb-2 leading-6">Бонус зданий</div>
          <div className="text-base font-semibold text-muted-foreground leading-[19px]">
            Автоматически увеличивает или уменьшает размер следующего здания
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function MapScoreBonusCard({ mapBonus }: { mapBonus?: number }) {
  const isMobile = useIsMobile();
  const [showDescription, setShowDescription] = useState(false);

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

  if (!mapBonus) {
    return null;
  }

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
          className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl cursor-pointer"
          onClick={handleCardClick}
        >
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl overflow-hidden data-[positive=true]:bg-green-500 bg-red-500 justify-center items-center text-4xl"
            data-positive={mapBonus > 0}
          >
            {mapBonus > 0 && '+'}
            {mapBonus}
          </div>
        </div>
        {showDescription && (
          <div
            className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-card/95 backdrop-blur-[1.5rem] p-4 rounded-lg border shadow-lg w-full max-w-sm">
              <div className="text-[16px] font-semibold mb-2">Бонус круга</div>
              <div className="text-sm font-semibold text-muted-foreground">
                Автоматически добавляет бонус к каждой пройденной игре
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] text-primary-foreground rounded-xl">
      <Tooltip delayDuration={0} disableHoverableContent>
        <TooltipTrigger>
          <div
            className="flex md:w-[134px] md:h-[189px] w-[122px] h-[170px] rounded-xl  data-[positive=true]:bg-green-500 bg-red-500 justify-center text-4xl"
            data-positive={mapBonus > 0}
          >
            <div>
              <div className="text-xl mt-4 mb-4">
                Бонус
                <br /> круга
              </div>
              {mapBonus > 0 && '+'}
              {mapBonus}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
          side="right"
          align="start"
          sideOffset={8}
        >
          <div className="text-[20px] font-semibold mb-2 leading-6">Бонус круга</div>
          <div className="text-base font-semibold text-muted-foreground leading-[19px]">
            Автоматически добавляет бонус к каждой пройденной игре
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
