import usePlayerStore from '@/stores/playerStore';
import { Card } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { frontendCardsData } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';
import { ManualUseCard } from '@/lib/types';
import { useState } from 'react';
import BonusCardUsedConfirmation from './turnUI/BonusCardUsedConfirmation';
import { activateBonusCard } from '@/lib/api';
import { resetPlayersQuery } from '@/lib/queryClient';
import { MainBonusCardType } from '@/lib/api-types-generated';

export default function MyCards() {
  const { cards, turnState } = usePlayerStore(
    useShallow(state => ({
      cards: state.myPlayer?.bonus_cards ?? [],
      turnState: state.turnState,
    }))
  );

  const [usedCard, setUsedCard] = useState<ManualUseCard | null>(null);

  const handleUseCard = async (cardType: MainBonusCardType) => {
    if (cardType === 'reroll-game' || cardType === 'game-help-allowed') {
      await activateBonusCard({ bonus_type: cardType });
      setUsedCard(cardType);
      resetPlayersQuery();
      return;
    }
  };

  const handleDialogClose = () => {
    setUsedCard(null);
  };

  return (
    <>
      {usedCard && <BonusCardUsedConfirmation card={usedCard} onClose={handleDialogClose} />}
      <Card className="p-2 gap-2" style={{ width: '300px' }}>
        <span>Мои карточки</span>
        <div className="flex flex-wrap gap-2 ">
          {cards.map((card, idx) => {
            const cardData = frontendCardsData[card.bonus_type];
            const canBeUsed =
              turnState === 'filling-game-review' &&
              (card.bonus_type === 'reroll-game' || card.bonus_type === 'game-help-allowed');
            return (
              <Tooltip delayDuration={0} key={idx}>
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
                      <Button className="w-full" onClick={() => handleUseCard(card.bonus_type)}>
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
    </>
  );
}
