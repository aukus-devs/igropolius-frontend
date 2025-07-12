import { BonusCardType } from '@/lib/types';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';

export default function LoseCardOnDropDialog() {
  const { playerCards, loseBonusCard } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards || [],
      loseBonusCard: state.loseBonusCard,
    }))
  );

  const options: WeightedOption<BonusCardType>[] = useMemo(() => {
    return playerCards.map(card => ({
      label: frontendCardsData[card.bonus_type].name,
      imageUrl: frontendCardsData[card.bonus_type].picture,
      value: card.bonus_type,
      weight: 1,
    }));
  }, [playerCards]);

  const getWinnerText = (option: WeightedOption<BonusCardType>) => {
    return `Карточка "${frontendCardsData[option.value].name}" сгорает`;
  };

  const handleFinished = async (option: WeightedOption<BonusCardType>) => {
    loseBonusCard(option.value);
  };

  return (
    <GenericRoller<BonusCardType>
      header="Потеря карточки в тюрьме"
      options={options}
      getWinnerText={getWinnerText}
      onFinished={handleFinished}
    />
  );
}
