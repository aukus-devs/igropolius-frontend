import usePlayerStore from '@/stores/playerStore';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';
import { MainBonusCardType } from '@/lib/api-types-generated';
import { dropBonusCard } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type LoseCard = {
  action: 'lose-card';
  card: MainBonusCardType;
};

type ReceiveCard = {
  action: 'receive-card';
  card: MainBonusCardType;
};

type RollOptionType = 'nothing' | LoseCard | ReceiveCard;

export default function PrisonEnterCardRoll() {
  const {
    setNextTurnState,
    playerCards,
    prisonCards,
    receiveBonusCard,
    removeCardFromState,
    prisonHasNoCards,
  } = usePlayerStore(
    useShallow(state => ({
      setNextTurnState: state.setNextTurnState,
      playerCards: state.myPlayer?.bonus_cards ?? [],
      prisonCards: state.prisonCards,
      receiveBonusCard: state.receiveBonusCard,
      removeCardFromState: state.removeCardFromState,
      prisonHasNoCards: state.prisonCards.length === 0,
    }))
  );

  const [cardsBeforeDrop, setCardsBeforeDrop] = useState<MainBonusCardType[]>([]);

  const getWinnerText = (option: WeightedOption<RollOptionType>) => {
    if (option.value === 'nothing') {
      return 'Ничего не происходит';
    }
    switch (option.value.action) {
      case 'lose-card': {
        return `Вы теряете карточку ${option.value.card}`;
      }
      case 'receive-card': {
        return `Вы получаете карточку ${option.value.card}`;
      }
    }
  };

  const handleFinished = async (option: WeightedOption<RollOptionType>) => {
    if (option.value === 'nothing') {
      return;
    }
    if (option.value.action === 'lose-card') {
      setCardsBeforeDrop(playerCards.map(card => card.bonus_type));
      await dropBonusCard({ bonus_type: option.value.card });
      removeCardFromState(option.value.card);
      return;
    }
    if (option.value.action === 'receive-card') {
      await receiveBonusCard(option.value.card, false);
      return;
    }
  };

  const handleClose = async () => {
    return setNextTurnState({});
  };

  const options: WeightedOption<RollOptionType>[] = useMemo(() => {
    const result: WeightedOption<RollOptionType>[] = [];

    const nothingOption: WeightedOption<RollOptionType> = {
      value: 'nothing',
      label: 'Ничего',
      weight: 25,
      imageUrl: 'https://placehold.co/100x100?text=Nothing',
    };

    if (prisonCards.length > 0) {
      const newPrisonCards = prisonCards.filter(
        card => !playerCards.some(playerCard => playerCard.bonus_type === card.bonus_type)
      );

      const prisonCardWeight = 25 / newPrisonCards.length;
      newPrisonCards.forEach(card => {
        result.push({
          value: {
            action: 'receive-card',
            card: card.bonus_type,
          },
          label: `Получить ${frontendCardsData[card.bonus_type].name}`,
          weight: prisonCardWeight,
          imageUrl: frontendCardsData[card.bonus_type].picture,
        });
      });
    } else {
      nothingOption.weight += 25;
    }

    if (playerCards.length > 0) {
      const playerCardWeight = 50 / playerCards.length;
      playerCards.forEach(card => {
        result.push({
          value: {
            action: 'lose-card',
            card: card.bonus_type,
          },
          label: `Потерять ${frontendCardsData[card.bonus_type].name}`,
          weight: playerCardWeight,
          imageUrl: frontendCardsData[card.bonus_type].picture,
        });
      });
    } else {
      nothingOption.weight += 50;
    }

    result.push(nothingOption);

    return result;
  }, [playerCards, prisonCards]);

  if (playerCards.length === 0 && cardsBeforeDrop.length === 0 && prisonHasNoCards) {
    return <NoCardsForPrisonDialog />;
  }

  return (
    <GenericRoller<RollOptionType>
      header="Вход в тюрьму"
      openButtonText="Войти в тюрьму"
      finishButtonText="Закрыть"
      options={options}
      getWinnerText={getWinnerText}
      onRollFinish={handleFinished}
      onClose={handleClose}
    />
  );
}

function NoCardsForPrisonDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Нет карточек для ролла в тюрьме</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => setNextTurnState({})}
        >
          Продолжить
        </Button>
      </div>
    </Card>
  );
}
