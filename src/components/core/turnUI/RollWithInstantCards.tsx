import { frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { activateInstantCard, giveBonusCard } from '@/lib/api';
import { useCallback, useMemo, useState } from 'react';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';
import {
  InstantCardType,
  MainBonusCardType,
  UseInstantCardResponse,
} from '@/lib/api-types-generated';
import useSystemStore from '@/stores/systemStore';
import { getCardDescription } from '@/lib/utils';

type InstantCard = {
  instant: InstantCardType;
};

type BonusCard = {
  card: MainBonusCardType;
};

type OptionType = InstantCard | BonusCard;

type Props = {
  autoOpen?: boolean;
  onClose: (result?: 'drop' | 'reroll') => void;
};

export default function RollWithInstantCards({ autoOpen, onClose }: Props) {
  const { playerCards, setNextTurnState, addCardToState, difficultyLevel } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards,
      setNextTurnState: state.setNextTurnState,
      addCardToState: state.addCardToState,
      difficultyLevel: state.myPlayer?.game_difficulty_level,
    }))
  );

  const [activationResult, setActivationResult] = useState<UseInstantCardResponse | null>(null);
  const [moveToCardDrop, setMoveToCardDrop] = useState<boolean>(false);
  const [rollFinished, setRollFinished] = useState(false);

  const handleFinished = useCallback(
    async (option: WeightedOption<OptionType>) => {
      setRollFinished(true);
      if (isInstantCard(option.value)) {
        if (option.value.instant === 'lose-card-or-3-percent') {
          useSystemStore.setState(state => ({
            ...state,
            disableCurrentPlayerQuery: true,
          }));
          await setNextTurnState({ action: 'drop-from-lose-card', skipUpdate: true });
          setMoveToCardDrop(true);
          return;
        }
        if (option.value.instant === 'police-search') {
          useSystemStore.setState(state => ({
            ...state,
            disableCurrentPlayerQuery: true,
          }));
          await setNextTurnState({ action: 'drop-from-police-search', skipUpdate: true });
          setMoveToCardDrop(true);
          return;
        }
        const response = await activateInstantCard({ card_type: option.value.instant });
        setActivationResult(response);
        resetCurrentPlayerQuery();
        resetPlayersQuery();
      } else if (isBonusCard(option.value)) {
        const newCard = await giveBonusCard({ bonus_type: option.value.card });
        addCardToState(newCard);
      }
    },
    [setActivationResult, setNextTurnState, addCardToState]
  );

  const getWinnerText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      let activationText = '';
      if (rollFinished) {
        if (
          activationResult?.result === 'reroll' &&
          option.value.instant !== 'reroll' &&
          option.value.instant !== 'reroll-and-roll'
        ) {
          activationText = ': выпал реролл';
        }
        if (activationResult?.result === 'score-change') {
          const amount = activationResult.score_change ?? 0;
          if (amount > 0) {
            activationText = `: получено +${amount}`;
          } else if (amount < 0) {
            activationText = `: потеряно ${Math.abs(amount)}`;
          }
        }
      }

      return frontendInstantCardsData[option.value.instant].name + activationText;
    }
    if (isBonusCard(option.value)) {
      const name = frontendCardsData[option.value.card].name;
      if (rollFinished) {
        return `Получено: "${name}"`;
      }
      return name;
    }
    return 'Неизвестный тип карточки' as never;
  };

  const getSecondaryText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      const description = getCardDescription(frontendInstantCardsData[option.value.instant]);
      return `Активируется автоматически: ${description}`;
    }
    if (isBonusCard(option.value)) {
      return getCardDescription(frontendCardsData[option.value.card]);
    }
    return 'Неизвестный тип карточки' as never;
  };

  const options = useMemo(() => {
    const result: WeightedOption<OptionType>[] = [];

    const myCurrentCardsTypes = playerCards ? playerCards.map(card => card.bonus_type) : [];

    const allCardTypes = Object.keys(frontendCardsData) as MainBonusCardType[];
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

    const removeDifficultyCards: InstantCardType[] = [];
    if (difficultyLevel === -1) {
      removeDifficultyCards.push('decrease-difficulty');
    } else if (difficultyLevel === 1) {
      removeDifficultyCards.push('increase-difficulty');
    }

    Object.entries(frontendInstantCardsData).forEach(([instantType_, cardData]) => {
      const instantType = instantType_ as InstantCardType;
      if (removeDifficultyCards.includes(instantType)) {
        return;
      }
      if (cardData.disabled) {
        return;
      }
      result.push({
        value: { instant: instantType },
        label: cardData.name,
        weight: 1,
        imageUrl: cardData.picture,
      });
    });
    return result;
  }, [playerCards, difficultyLevel]);

  let finishText = 'Готово';
  if (moveToCardDrop) {
    finishText = 'Перейти к дропу карточки';
  } else if (activationResult?.result === 'reroll') {
    finishText = 'Реролл';
  }

  const handleClose = () => {
    setRollFinished(false);
    if (moveToCardDrop) {
      onClose('drop');
    } else if (activationResult?.result === 'reroll') {
      onClose('reroll');
    } else {
      onClose();
    }

    useSystemStore.getState().enableQueries(true);
    resetPlayersQuery();

    setActivationResult(null);
    setMoveToCardDrop(false);
  };

  return (
    <GenericRoller<OptionType>
      key="roll-with-instant-cards"
      autoOpen={autoOpen}
      options={options}
      header="Ролл карточки"
      openButtonText="Ролл за донат"
      finishButtonText={finishText}
      onRollFinish={handleFinished}
      getWinnerText={getWinnerText}
      onClose={handleClose}
      getSecondaryText={getSecondaryText}
    />
  );
}

function isInstantCard(option: OptionType): option is InstantCard {
  return 'instant' in option;
}

function isBonusCard(option: OptionType): option is BonusCard {
  return 'card' in option;
}
