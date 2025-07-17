import { BonusCardType } from '@/lib/types';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { activateInstantCard, loseBonusCard } from '@/lib/api';

export default function LoseCardOnDropDialog() {
  const { playerCards, moveToPrison, setNextTurnState, goToPrison } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards || [],
      moveToPrison: state.moveMyPlayerToPrison,
      setNextTurnState: state.setNextTurnState,
      goToPrison: state.turnState === 'dropping-card-after-game-drop',
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
    if (goToPrison) {
      await loseBonusCard(option.value);
      await moveToPrison();
    } else {
      await activateInstantCard('lose-card-or-3-percent', option.value);
    }
    await setNextTurnState({});
  };

  const buttonText = goToPrison ? 'Дропнуть и пойти в тюрьму' : 'Дропнуть карточку';

  return (
    <GenericRoller<BonusCardType>
      header="Потеря карточки за дроп"
      openButtonText="Дропнуть карточку"
      finishButtonText={buttonText}
      options={options}
      getWinnerText={getWinnerText}
      onFinished={handleFinished}
    />
  );
}
