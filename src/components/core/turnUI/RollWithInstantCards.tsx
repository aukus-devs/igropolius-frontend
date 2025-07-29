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

export default function RollWithInstantCards() {
  const { playerCards, setNextTurnState, hasDowngradeBonus, hasUpgradeBonus, addCardToState } =
    usePlayerStore(
      useShallow(state => ({
        playerCards: state.myPlayer?.bonus_cards,
        setNextTurnState: state.setNextTurnState,
        hasDowngradeBonus: state.hasDowngradeBonus,
        hasUpgradeBonus: state.hasUpgradeBonus,
        addCardToState: state.addCardToState,
      }))
    );

  const [activationResult, setActivationResult] = useState<InstantCardResult | null>(null);
  const [moveToCardDrop, setMoveToCardDrop] = useState<boolean>(false);

  const handleFinished = useCallback(
    async (option: WeightedOption<OptionType>) => {
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
        useSystemStore.setState(state => ({
          ...state,
          disableCurrentPlayerQuery: true,
        }));
        const newCard = await giveBonusCard({ bonus_type: option.value.card });
        addCardToState(newCard);

        setNextTurnState({ skipUpdate: true });
      }
    },
    [setActivationResult, setNextTurnState, addCardToState]
  );

  const getWinnerText = (option: WeightedOption<OptionType>) => {
    if (isInstantCard(option.value)) {
      return frontendInstantCardsData[option.value.instant].description;
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
      if (hasDowngradeBonus && instantType === 'downgrade-next-building') {
        return; // Skip this card if downgrade bonus is active
      }
      if (hasUpgradeBonus && instantType === 'upgrade-next-building') {
        return; // Skip this card if upgrade bonus is active
      }
      result.push({
        value: { instant: instantType },
        label: cardData.name,
        weight: 1,
        imageUrl: cardData.picture,
      });
    });

    return result;
  }, [playerCards, hasDowngradeBonus, hasUpgradeBonus]);

  let finishText = 'Готово';
  if (moveToCardDrop) {
    finishText = 'Перейти к дропу карточки';
  }

  const handleClose = async () => {
    useSystemStore.setState(state => ({
      ...state,
      disableCurrentPlayerQuery: false,
    }));
  };

  const getSecondaryText = () => {
    if (activationResult === 'reroll') {
      return 'Выпал реролл';
    }
    if (activationResult === 'score-received') {
      return 'Вы получили 5% от своего счёта';
    }
  };

  return (
    <GenericRoller<OptionType>
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
