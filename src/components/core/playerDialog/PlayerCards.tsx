import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { frontendCardsData } from "@/lib/mockData";
import { ActiveBonusCard, PlayerData } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";

type Props = {
  player: PlayerData;
};

export default function PlayerCards({ player }: Props) {
  const stealBonusCard = usePlayerStore((state) => state.stealBonusCard);

  if (player.bonus_cards.length === 0) {
    return <div className="">Нет карточек</div>;
  }

  return (
    <div className="flex gap-2">
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
  const cardData = frontendCardsData[card.bonus_type];

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger
        className="flex w-[32px] h-[45px] rounded-sm overflow-hidden"
        onClick={() => onSelect()}
      >
        <img src={cardData.picture} />
      </TooltipTrigger>
      <TooltipContent
        className="max-w-[280px] bg-card/70 backdrop-blur-[1.5rem] p-3"
        side="bottom"
        align="start"
        sideOffset={8}
      >
        <div className="text-[20px] font-semibold mb-2">{cardData.name}</div>
        <div className="text-base font-semibold text-muted-foreground">{cardData.description}</div>
      </TooltipContent>
    </Tooltip>
  );
}
