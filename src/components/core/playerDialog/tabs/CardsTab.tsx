import { frontendCardsData } from "@/lib/mockData";
import { ActiveBonusCard } from "@/lib/types";

function CardsTab({ cards }: { cards: ActiveBonusCard[] }) {
  return (
    <div>
      {cards.map((card, idx) => {
        const cardData = frontendCardsData[card.type];
        return <div key={idx}>{cardData.name}</div>;
      })}
    </div>
  );
}

export default CardsTab;
