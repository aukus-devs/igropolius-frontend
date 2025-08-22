import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { MainBonusCardType } from '@/lib/api-types-generated';
import { giveBonusCard } from '@/lib/api';
import useSystemStore from '@/stores/systemStore';
import { refetechPlayersQuery, resetNotificationsQuery } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getCardDescription } from '@/lib/utils';

export default function RollBonusCard() {
  const { myPlayer, setNextTurnState, addCardToState } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      setNextTurnState: state.setNextTurnState,
      addCardToState: state.addCardToState,
    }))
  );

  const getCardWeight = useSystemStore(state => state.getCardWeight);

  const [cardsBeforeRoll, setCardsBeforeRoll] = useState(myPlayer?.bonus_cards ?? []);

  const handleFinished = async (option: WeightedOption<MainBonusCardType>) => {
    setCardsBeforeRoll(myPlayer?.bonus_cards ?? []);
    const newCard = await giveBonusCard({ bonus_type: option.value });
    addCardToState({ ...newCard, cooldown_turns_left: -1 });
    setNextTurnState({ skipUpdate: true });
    resetNotificationsQuery();
  };

  const handleClose = () => {
    useSystemStore.getState().enableQueries(true);
    refetechPlayersQuery();
  };

  const getWinnerText = (option: WeightedOption<MainBonusCardType>) => {
    return frontendCardsData[option.value].name;
  };

  const getSecondaryText = (option: WeightedOption<MainBonusCardType>) => {
    return getCardDescription(frontendCardsData[option.value]);
  };

  const myCurrentCards = myPlayer?.bonus_cards ?? [];
  const myCurrentCardsTypes = myCurrentCards.map(card => card.bonus_type);

  const allCardTypes = Object.keys(frontendCardsData) as MainBonusCardType[];
  const cardTypesForRoll = allCardTypes.filter(cardType => !myCurrentCardsTypes.includes(cardType));

  const weightedOptions = cardTypesForRoll.reduce((acc, cardType) => {
    const weight = getCardWeight(cardType);
    acc.push({
      value: cardType,
      label: frontendCardsData[cardType].name,
      weight,
      imageUrl: frontendCardsData[cardType].picture,
    });
    return acc;
  }, [] as WeightedOption<MainBonusCardType>[]);

  if (weightedOptions.length === 0 && cardsBeforeRoll.length === allCardTypes.length) {
    return <NoCardsToReceive />;
  }

  return (
    <GenericRoller<MainBonusCardType>
      options={weightedOptions}
      header="Ролл бонусной карточки"
      openButtonText="Получить карточку"
      finishButtonText="Получить"
      onRollFinish={handleFinished}
      getWinnerText={getWinnerText}
      getSecondaryText={getSecondaryText}
      onClose={handleClose}
    />
  );
}

function NoCardsToReceive() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Ты собрал все карточки, нечего ролить</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={() => {
            useSystemStore.setState(state => ({
              ...state,
              disableCurrentPlayerQuery: false,
              disablePlayersQuery: false,
            }));
            setNextTurnState({});
          }}
        >
          Продолжить
        </Button>
      </div>
    </Card>
  );
}
