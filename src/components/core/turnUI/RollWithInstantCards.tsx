import { frontendCardsData, frontendInstantCardsData } from '@/lib/mockData';
import { BonusCardType, InstantCardResult, InstantCardType } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { activateInstantCard } from '@/lib/api';
import { useCallback, useMemo, useState } from 'react';
import { resetCurrentPlayerQuery, resetPlayersQuery } from '@/lib/queryClient';

type InstantCard = {
  instant: InstantCardType;
};

type BonusCard = {
  card: BonusCardType;
};

type OptionType = InstantCard | BonusCard;

export default function RollWithInstantCards() {
  const { receiveBonusCard, playerCards, setNextTurnState, hasDowngradeBonus, hasUpgradeBonus } =
    usePlayerStore(
      useShallow(state => ({
        receiveBonusCard: state.receiveBonusCard,
        playerCards: state.myPlayer?.bonus_cards ?? [],
        setNextTurnState: state.setNextTurnState,
        hasDowngradeBonus: state.hasDowngradeBonus,
        hasUpgradeBonus: state.hasUpgradeBonus,
      }))
    );

  const [activationResult, setActivationResult] = useState<InstantCardResult | null>(null);
  const [moveToCardDrop, setMoveToCardDrop] = useState<boolean>(false);

  const handleFinished = useCallback(
    async (option: WeightedOption<OptionType>) => {
      if (isInstantCard(option.value)) {
        if (option.value.instant === 'lose-card-or-3-percent') {
          setMoveToCardDrop(true);
          return;
        }
        const response = await activateInstantCard(option.value.instant);
        setActivationResult(response.result ?? 'default');
        resetCurrentPlayerQuery();
        resetPlayersQuery();
      } else if (isBonusCard(option.value)) {
        await receiveBonusCard(option.value.card, false);
      }
    },
    [receiveBonusCard, setActivationResult]
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
    if (moveToCardDrop) {
      await setNextTurnState({ action: 'drop-card' });
    }
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
