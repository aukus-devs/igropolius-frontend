import { frontendCardsData } from "@/lib/mockData";
import { ActiveBonusCard, BonusCardType } from "@/lib/types";

function CardsTab({ cards }: { cards: ActiveBonusCard[] }) {
  const cardTypes = Object.keys(frontendCardsData) as BonusCardType[];
  return (
    <div className="flex flex-col gap-2">
      {cardTypes.map((type) => {
        const hasCard = cards.some((card) => card.bonus_type === type);
        if (hasCard) {
          return (
            <div key={type} className="text-lg font-semibold">
              {frontendCardsData[type].name}
            </div>
          );
        }
        return (
          <div key={type} className="text-lg font-semibold text-muted-foreground">
            {frontendCardsData[type].name}
          </div>
        );
      })}
    </div>
  );
}

export default CardsTab;
