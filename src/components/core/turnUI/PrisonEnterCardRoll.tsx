import usePlayerStore from '@/stores/playerStore';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
import { bonusCardsData, frontendCardsData } from '@/lib/mockData';
import { useShallow } from 'zustand/shallow';
import { MainBonusCardType } from '@/lib/api-types-generated';
import { dropBonusCard, giveBonusCard } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PRISON_NOTHING_CARD_IMAGE } from '@/lib/constants';
import useSystemStore from '@/stores/systemStore';

type LoseCard = {
  action: 'lose-card';
  card: MainBonusCardType;
};

type ReceiveCard = {
  action: 'receive-card';
  card: MainBonusCardType;
};

type RollOptionType = 'nothing' | LoseCard | ReceiveCard;

export default function PrisonEnterCardRoll() {
  const {
    setNextTurnState,
    playerCardsOrEmpty,
    prisonCards,
    removeCardFromState,
    prisonHasNoCards,
    addCardToState,
  } = usePlayerStore(
    useShallow(state => ({
      setNextTurnState: state.setNextTurnState,
      playerCardsOrEmpty: state.myPlayer?.bonus_cards,
      prisonCards: state.prisonCards,
      removeCardFromState: state.removeCardFromState,
      prisonHasNoCards: state.prisonCards.length === 0,
      addCardToState: state.addCardToState,
    }))
  );

  const playerCards = useMemo(() => playerCardsOrEmpty || [], [playerCardsOrEmpty]);

  const [rollFinished, setRollFinished] = useState(false);
  const [cardsBeforeDrop, setCardsBeforeDrop] = useState<MainBonusCardType[]>([]);

  const getWinnerText = (option: WeightedOption<RollOptionType>) => {
    if (option.value === 'nothing') {
      return 'Ничего не происходит';
    }
    if (!rollFinished) {
      return bonusCardsData[option.value.card].name;
    }
    switch (option.value.action) {
      case 'lose-card': {
        return `Потеряна карточка "${bonusCardsData[option.value.card].name}"`;
      }
      case 'receive-card': {
        return `Получена карточка "${bonusCardsData[option.value.card].name}"`;
      }
      default: {
        return 'Неизвестное действие' as never;
      }
    }
  };

  const handleFinished = async (option: WeightedOption<RollOptionType>) => {
    setRollFinished(true);

    if (option.value === 'nothing') {
      setNextTurnState({ skipUpdate: true });
      return;
    }
    if (option.value.action === 'lose-card') {
      setCardsBeforeDrop(playerCards.map(card => card.bonus_type));
      await dropBonusCard({ bonus_type: option.value.card });
      removeCardFromState(option.value.card);
      setNextTurnState({ skipUpdate: true });
      return;
    }
    if (option.value.action === 'receive-card') {
      const newCard = await giveBonusCard({ bonus_type: option.value.card });
      addCardToState(newCard);
      setNextTurnState({ skipUpdate: true });
      return;
    }
  };

  const handleClose = async () => {
    setRollFinished(false);
    setCardsBeforeDrop([]);
    useSystemStore.getState().enableQueries(true);
  };

  const options: WeightedOption<RollOptionType>[] = useMemo(() => {
    const result: WeightedOption<RollOptionType>[] = [];

    const nothingOption: WeightedOption<RollOptionType> = {
      value: 'nothing',
      label: 'Ничего',
      weight: 25,
      imageUrl: PRISON_NOTHING_CARD_IMAGE,
    };

    if (prisonCards.length > 0) {
      const newPrisonCards = prisonCards.filter(
        card => !playerCards.some(playerCard => playerCard.bonus_type === card)
      );

      const prisonCardWeight = 25 / newPrisonCards.length;
      newPrisonCards.forEach(card => {
        result.push({
          value: {
            action: 'receive-card',
            card,
          },
          label: frontendCardsData[card].name,
          weight: prisonCardWeight,
          imageUrl: frontendCardsData[card].picture,
          variant: 'positive',
        });
      });
    } else {
      nothingOption.weight += 25;
    }

    if (playerCards.length > 0) {
      const playerCardWeight = 50 / playerCards.length;
      playerCards.forEach(card => {
        result.push({
          value: {
            action: 'lose-card',
            card: card.bonus_type,
          },
          label: frontendCardsData[card.bonus_type].name,
          weight: playerCardWeight,
          imageUrl: frontendCardsData[card.bonus_type].picture,
          variant: 'negative',
        });
      });
    } else {
      nothingOption.weight += 50;
    }

    result.push(nothingOption);

    return result;
  }, [playerCards, prisonCards]);

  if (playerCards.length === 0 && cardsBeforeDrop.length === 0 && prisonHasNoCards) {
    return <NoCardsForPrisonDialog />;
  }

  return (
    <GenericRoller<RollOptionType>
      header="Вход в тюрьму"
      openButtonText="Войти в тюрьму"
      finishButtonText="Закрыть"
      options={options}
      getWinnerText={getWinnerText}
      onRollFinish={handleFinished}
      onClose={handleClose}
    />
  );
}

function NoCardsForPrisonDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Нет карточек для ролла в тюрьме</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => setNextTurnState({})}
        >
          Закрыть
        </Button>
      </div>
    </Card>
  );
}
