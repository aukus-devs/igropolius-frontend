import { BonusCardType } from '@/lib/types';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { loseBonusCard } from '@/lib/api';
import { resetPlayersQuery } from '@/lib/queryClient';

export default function LoseCardOnDropDialog() {
  const { playerCards, moveToPrison, setNextTurnState } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards || [],
      moveToPrison: state.moveMyPlayerToPrison,
      setNextTurnState: state.setNextTurnState,
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
    await loseBonusCard(option.value);
    await moveToPrison();
    await setNextTurnState({});
    resetPlayersQuery();
  };

  return (
    <GenericRoller<BonusCardType>
      header="Потеря карточки за дроп"
      openButtonText="Дропнуть карточку"
      finishButtonText="Дропнуть и пойти в тюрьму"
      options={options}
      getWinnerText={getWinnerText}
      onFinished={handleFinished}
    />
  );
}
