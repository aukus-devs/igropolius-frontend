import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { frontendCardsData } from "@/lib/mockData";
import { ActiveBonusCard, PlayerData } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";
import { useState } from "react";

type Props = {
  player: PlayerData;
};

export default function PlayerCards({ player }: Props) {
  const stealBonusCard = usePlayerStore((state) => state.stealBonusCard);

  if (player.bonus_cards.length === 0) {
    return <div className="">Нет карточек</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {player.bonus_cards.map((card, index) => (
        <PlayerCard
          key={index}
          card={card}
          onSelect={() => {
            stealBonusCard(player, card.bonus_type);
          }}
        />
      ))}
    </div>
  );
}

function PlayerCard({ card, onSelect }: { card: ActiveBonusCard; onSelect: () => void }) {
  const [open, setOpen] = useState(false);

  const cardData = frontendCardsData[card.bonus_type];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="w-[32px] h-[45px] rounded-lg"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={(e) => {
            onSelect();
            e.stopPropagation();
          }}
        >
          <img src={cardData.picture} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3">
        <div>{cardData.description}</div>
      </PopoverContent>
    </Popover>
  );
}
