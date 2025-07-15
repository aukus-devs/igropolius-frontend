import { frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import { BonusCardType, InstantCardType } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { activateInstantCard } from '@/lib/api';
import { useMemo } from 'react';

type InstantCard = {
  instant: InstantCardType;
};

type BonusCard = {
  card: BonusCardType;
};

type OptionType = InstantCard | BonusCard;

export default function RollWithInstantCards() {
  const { receiveBonusCard, playerCards } = usePlayerStore(
    useShallow(state => ({
      receiveBonusCard: state.receiveBonusCard,
      playerCards: state.myPlayer?.bonus_cards ?? [],
    }))
  );

  const handleFinished = async (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      await activateInstantCard(option.value.instant);
    } else if (isBonusCard(option.value)) {
      await receiveBonusCard(option.value.card, false);
    }
  };

  const getWinnerText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      return `Срабатывает карточка "${frontendInstantCardsData[option.value.instant].name}"`;
    }
    if (isBonusCard(option.value)) {
      return `Выпала карточка "${frontendCardsData[option.value.card].name}"`;
    }
    return 'Неизвестный тип карточки' as never;
  };

  const options = useMemo(() => {
    const result: WeightedOption<OptionType>[] = [];

    const myCurrentCardsTypes = playerCards.map(card => card.bonus_type) as BonusCardType[];

    const allCardTypes = Object.keys(frontendCardsData) as BonusCardType[];
    const cardTypesForRoll = allCardTypes.filter(
      cardType => !myCurrentCardsTypes.includes(cardType)
    );
    cardTypesForRoll.forEach(cardType => {
      const cardData = frontendCardsData[cardType];
      if (cardData) {
        result.push({
          value: { card: cardType },
          label: cardData.name,
          weight: 1,
          imageUrl: cardData.picture,
        });
      }
    });

    Object.entries(frontendInstantCardsData).forEach(([instantType, cardData]) => {
      result.push({
        value: { instant: instantType as InstantCardType },
        label: cardData.name,
        weight: 1,
        imageUrl: cardData.picture,
      });
    });

    return result;
  }, [playerCards]);

  return (
    <GenericRoller<OptionType>
      options={options}
      header="Ролл карточки"
      openButtonText="Ролл за донат"
      finishButtonText="Готово"
      onFinished={handleFinished}
      getWinnerText={getWinnerText}
    />
  );
}

function isInstantCard(option: OptionType): option is InstantCard {
  return 'instant' in option;
}

function isBonusCard(option: OptionType): option is BonusCard {
  return 'card' in option;
}
