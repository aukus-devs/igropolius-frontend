import { DeckCardData } from "@/lib/types";

function CardsTab({ cards }: { cards: DeckCardData[] }) {
  return (
    <div>
      {cards.map((card, idx) => (
        <div key={idx}>
          {card.name}
        </div>
      ))}
    </div>
  )
}

export default CardsTab;
