import { frontendCardsData } from '@/lib/mockData';
import { BonusCardType } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useMutation } from '@tanstack/react-query';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo } from 'react';

export default function RollBonusCard() {
  const { receiveBonusCard, myPlayer } = usePlayerStore(
    useShallow(state => ({
      receiveBonusCard: state.receiveBonusCard,
      myPlayer: state.myPlayer,
    }))
  );

  const { mutateAsync: doReceiveBonusCard } = useMutation({
    mutationFn: async (cardType: BonusCardType) => {
      return receiveBonusCard(cardType);
    },
  });

  const handleFinished = async (option: BonusCardType) => {
    await doReceiveBonusCard(option);
  };

  const getWinnerText = (option: BonusCardType) => {
    return `Вы выиграли карточку "${frontendCardsData[option].name}"`;
  };

  const myCurrentCards = myPlayer?.bonus_cards ?? [];
  const myCurrentCardsTypes = myCurrentCards.map(card => card.bonus_type) as BonusCardType[];

  const allCardTypes = Object.keys(frontendCardsData) as BonusCardType[];
  const cardTypesForRoll = allCardTypes.filter(cardType => !myCurrentCardsTypes.includes(cardType));

  const weightedOptions = cardTypesForRoll.reduce((acc, cardType) => {
    acc.push({
      value: cardType,
      label: frontendCardsData[cardType].name,
      weight: 1,
    });
    return acc;
  }, [] as WeightedOption<BonusCardType>[]);

  const imagesMap = useMemo(
    () =>
      Object.entries(frontendCardsData).reduce(
        (acc, [cardType, card]) => {
          acc[cardType] = card.picture;
          return acc;
        },
        {} as Record<string, string>
      ),
    []
  );

  return (
    <GenericRoller<BonusCardType>
      options={weightedOptions}
      header={'Ролим бонусную карточку'}
      onFinished={handleFinished}
      getWinnerText={getWinnerText}
      imagesMap={imagesMap}
    />
  );
}
