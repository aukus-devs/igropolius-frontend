import usePlayerStore from '@/stores/playerStore';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { BonusCardType } from '@/lib/types';
import { useMemo } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';

type LoseCard = {
  action: 'lose-card';
  card: BonusCardType;
};

type ReceiveCard = {
  action: 'receive-card';
  card: BonusCardType;
};

type RollOptionType = 'nothing' | LoseCard | ReceiveCard;

export default function PrisonEnterCardRoll() {
  const { setNextTurnState, playerCards, prisonCards, receiveBonusCard, dropBonusCard } =
    usePlayerStore(
      useShallow(state => ({
        setNextTurnState: state.setNextTurnState,
        playerCards: state.myPlayer?.bonus_cards ?? [],
        prisonCards: state.prisonCards,
        receiveBonusCard: state.receiveBonusCard,
        dropBonusCard: state.dropBonusCard,
      }))
    );

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
      setNextTurnState({});
      return;
    }
    if (option.value.action === 'lose-card') {
      await dropBonusCard(option.value.card);
      return;
    }
    if (option.value.action === 'receive-card') {
      await receiveBonusCard(option.value.card);
      return;
    }
  };

  const options: WeightedOption<RollOptionType>[] = useMemo(() => {
    const result: WeightedOption<RollOptionType>[] = [];

    const nothingOption: WeightedOption<RollOptionType> = {
      value: 'nothing',
      label: 'Ничего',
      weight: 25,
      imageUrl: '',
    };

    if (prisonCards.length > 0) {
      const prisonCardWeight = 25 / prisonCards.length;
      prisonCards.forEach(card => {
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

  return (
    <GenericRoller<RollOptionType>
      header="Вход в тюрьму"
      openButtonText="Войти в тюрьму"
      finishButtonText="Готово"
      options={options}
      getWinnerText={getWinnerText}
      onFinished={handleFinished}
    />
  );
}
