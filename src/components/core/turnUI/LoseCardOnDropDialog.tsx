import { BonusCardType, InstantCardResult } from '@/lib/types';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
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

  const [dropResult, setDropResult] = useState<InstantCardResult | null>(null);

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
    } else {
      const result = await activateInstantCard('lose-card-or-3-percent', option.value);
      setDropResult(result.result ?? null);
    }
  };

  const getSecondaryText = () => {
    if (dropResult) {
      if (dropResult === 'card-lost') {
        return 'Карточка потеряна';
      } else if (dropResult === 'score-lost') {
        return 'Потеряно 3% от общего счёта';
      } else if (dropResult === 'reroll') {
        return 'Реролл дропа';
      }
    }
    return undefined;
  };

  const handleClose = async () => {
    if (dropResult === 'reroll') {
      setDropResult(null);
      return;
    }
    if (goToPrison) {
      await moveToPrison();
    }
    await setNextTurnState({});
  };

  let buttonText = 'Готово';
  if (goToPrison) {
    buttonText = 'Пойти в тюрьму';
  }
  if (dropResult === 'reroll') {
    buttonText = 'Реролл';
  }

  return (
    <GenericRoller<BonusCardType>
      header="Потеря карточки"
      openButtonText="Дропнуть карточку"
      finishButtonText={buttonText}
      options={options}
      getWinnerText={getWinnerText}
      onRollFinish={handleFinished}
      onClose={handleClose}
      getSecondaryText={getSecondaryText}
    />
  );
}
