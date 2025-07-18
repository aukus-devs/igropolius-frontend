import { frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import { BonusCardType, InstantCardResult, InstantCardType } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { activateInstantCard } from '@/lib/api';
import { useMemo, useState } from 'react';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';

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

  const [activationResult, setActivationResult] = useState<InstantCardResult | null>(null);

  const handleFinished = async (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      const response = await activateInstantCard(option.value.instant);
      setActivationResult(response.result ?? 'default');
      resetCurrentPlayerQuery();
      resetPlayersQuery();
    } else if (isBonusCard(option.value)) {
      await receiveBonusCard(option.value.card, false);
    }
  };

  const getWinnerText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      return frontendInstantCardsData[option.value.instant].description;
    }
    if (isBonusCard(option.value)) {
      return frontendCardsData[option.value.card].name;
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
      getSecondaryText={(option: WeightedOption<OptionType>) => {
        if (isInstantCard(option.value)) {
          return getSecondaryText(option.value.instant, activationResult);
        }
        return undefined;
      }}
    />
  );
}

function isInstantCard(option: OptionType): option is InstantCard {
  return 'instant' in option;
}

function isBonusCard(option: OptionType): option is BonusCard {
  return 'card' in option;
}

function getSecondaryText(cardType: InstantCardType, result: InstantCardResult | null) {
  switch (cardType) {
    case 'lose-card-or-3-percent':
      switch (result) {
        case 'card-lost':
          return 'Карточка потеряна';
        case 'score-lost':
          return 'Потеряно 3% очков';
      }
      break;
    case 'receive-5-percent-or-reroll':
      switch (result) {
        case 'reroll':
          return 'Реролл колеса';
        case 'score-received':
          return 'Получено 5% очков';
      }
      break;
  }
  return undefined;
}
