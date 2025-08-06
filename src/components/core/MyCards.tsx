import usePlayerStore from '@/stores/playerStore';
import { Card } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { frontendCardsData, mainCardTypes } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';
import { ManualUseCard } from '@/lib/types';
import { useState } from 'react';
import BonusCardUsedConfirmation from './turnUI/BonusCardUsedConfirmation';
import { activateBonusCard } from '@/lib/api';
import { resetPlayersQuery } from '@/lib/queryClient';
import { MainBonusCardType } from '@/lib/api-types-generated';
import ImageLoader from './ImageLoader';

export default function MyCards() {
  const { myCards, turnState } = usePlayerStore(
    useShallow(state => ({
      myCards: state.myPlayer?.bonus_cards,
      turnState: state.turnState,
    }))
  );

  const cards = myCards || [];

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
      <Card className="flex flex-row p-2 gap-2">
        {mainCardTypes.map((bonus, idx) => {
          const cardData = frontendCardsData[bonus];
          const cardOwned = cards.find(card => card.bonus_type === bonus);
          const canBeUsed =
            cardOwned &&
            turnState === 'filling-game-review' &&
            (bonus === 'reroll-game' || bonus === 'game-help-allowed');
          return (
            <Tooltip delayDuration={0} key={idx}>
              <TooltipTrigger>
                <ImageLoader
                  className="relative z-10 flex w-[32px] h-[45px] rounded-sm overflow-hidden data-[usable=true]:animate-shake data-[inactive=true]:grayscale-100"
                  data-usable={canBeUsed}
                  data-inactive={!cardOwned}
                  src={cardData.picture}
                  alt={cardData.name}
                />
              </TooltipTrigger>
              <TooltipContent
                className="bg-card/70 backdrop-blur-[1.5rem] p-3 rounded-xl"
                side="bottom"
                align="start"
                sideOffset={8}
              >
                <div className="flex gap-4">
                  <div className="">
                    <ImageLoader
                      src={cardData.picture}
                      alt={cardData.name}
                      className="w-[200px] rounded-md overflow-hidden"
                    />
                  </div>
                  <div className="w-[200px]">
                    <div className="text-[20px] font-semibold mb-2 leading-6">{cardData.name}</div>
                    <div className="text-base font-semibold text-muted-foreground leading-[19px]">
                      {cardData.description}
                    </div>
                    {canBeUsed && (
                      <div className="mt-2 w-full">
                        <Button className="w-full" onClick={() => handleUseCard(bonus)}>
                          Использовать
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </Card>
    </>
  );
}
