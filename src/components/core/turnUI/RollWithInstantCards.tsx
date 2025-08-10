import { frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { activateInstantCard, giveBonusCard } from '@/lib/api';
import { useCallback, useMemo, useState } from 'react';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';
import { InstantCardResult, InstantCardType, MainBonusCardType } from '@/lib/api-types-generated';
import useSystemStore from '@/stores/systemStore';

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
  const { playerCards, setNextTurnState, addCardToState } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards,
      setNextTurnState: state.setNextTurnState,
      addCardToState: state.addCardToState,
    }))
  );

  const [activationResult, setActivationResult] = useState<InstantCardResult | null>(null);
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
          await setNextTurnState({ action: 'drop-card', skipUpdate: true });
          setMoveToCardDrop(true);
          return;
        }
        const response = await activateInstantCard({ card_type: option.value.instant });
        setActivationResult(response.result ?? null);
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
          activationResult === 'reroll' &&
          option.value.instant !== 'reroll' &&
          option.value.instant !== 'reroll-and-roll'
        ) {
          activationText = ': выпал реролл';
        }
        if (activationResult === 'score-received') {
          activationText = ': получено 5% от своего счёта';
        }
      }

      return frontendInstantCardsData[option.value.instant].name + activationText;
    }
    if (isBonusCard(option.value)) {
      const name = frontendCardsData[option.value.card].name;
      if (rollFinished) {
        return `Получено: «${name}»`;
      }
      return name;
    }
    return 'Неизвестный тип карточки' as never;
  };

  const getSecondaryText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      const description = frontendInstantCardsData[option.value.instant].description;
      return `Активируется автоматически: ${description}`;
    }
    if (isBonusCard(option.value)) {
      return frontendCardsData[option.value.card].description;
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

    Object.entries(frontendInstantCardsData).forEach(([instantType_, cardData]) => {
      const instantType = instantType_ as InstantCardType;
      result.push({
        value: { instant: instantType },
        label: cardData.name,
        weight: 1,
        imageUrl: cardData.picture,
      });
    });

    return result;
  }, [playerCards]);

  let finishText = 'Готово';
  if (moveToCardDrop) {
    finishText = 'Перейти к дропу карточки';
  } else if (activationResult === 'reroll') {
    finishText = 'Реролл';
  }

  const handleClose = () => {
    setRollFinished(false);
    if (moveToCardDrop) {
      onClose('drop');
    } else if (activationResult === 'reroll') {
      onClose('reroll');
    } else {
      onClose();
    }

    useSystemStore.getState().enableQueries(true);

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
