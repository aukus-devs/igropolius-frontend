import { cardTypes, frontendCardsData } from "@/lib/mockData";
import { ActiveBonusCard, BonusCardType } from "@/lib/types";

type GameCardProps = {
  type: BonusCardType;
  inactive?: boolean;
};

function GameCard({ type, inactive }: GameCardProps) {
  const title = frontendCardsData[type].name;

  return (
    <div
      className="flex md:w-[134px] md:h-[189px] w-[122px] h-[173px] bg-primary text-primary-foreground rounded-xl data-[inactive=true]:pointer-events-none data-[inactive=true]:grayscale-100"
      data-inactive={inactive}
    >
      <div className="text-lg font-semibold">{title}</div>
    </div>
  );
}

function CardsTab({ cards }: { cards: ActiveBonusCard[] }) {
  const availableCards = cardTypes.filter((type) => cards.some((card) => card.bonus_type === type));
  const unavailableCards = cardTypes.filter((type) => !availableCards.includes(type));

  return (
    <div className="flex flex-col my-5">
      {availableCards.length > 0 && (
        <div className="flex flex-wrap gap-y-2.5 gap-x-2 mb-[50px] justify-center">
          {availableCards.map((type) =>
            <GameCard key={type} type={type} />
          )}
        </div>
      )}

      {unavailableCards.length > 0 && (
        <>
          <p className="text-center text-xs font-wide-semibold text-muted-foreground mb-5">Не полученые</p>
          <div className="flex flex-wrap gap-y-2.5 gap-x-2 justify-center">
            {unavailableCards.map((type) =>
              <GameCard key={type} type={type} inactive />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CardsTab;
