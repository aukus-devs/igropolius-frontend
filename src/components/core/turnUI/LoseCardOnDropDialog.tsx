import { BonusCardType } from '@/lib/types';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { loseBonusCard } from '@/lib/api';

export default function LoseCardOnDropDialog() {
  const { playerCards } = usePlayerStore(
    useShallow(state => ({ playerCards: state.myPlayer?.bonus_cards || [] }))
  );

  const options: WeightedOption<BonusCardType>[] = useMemo(() => {
    return playerCards.map(card => ({
      label: frontendCardsData[card.bonus_type].name,
      value: card.bonus_type,
      weight: 1,
    }));
  }, [playerCards]);

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

  const getWinnerText = (option: BonusCardType) => {
    return `Карточка "${frontendCardsData[option].name}" сгорает`;
  };

  const handleFinished = async (option: BonusCardType) => {
    loseBonusCard(option);
  };

  return (
    <GenericRoller<BonusCardType>
      header="Потеря карточки из-за дропа"
      options={options}
      imagesMap={imagesMap}
      getWinnerText={getWinnerText}
      onFinished={handleFinished}
    />
  );
}
