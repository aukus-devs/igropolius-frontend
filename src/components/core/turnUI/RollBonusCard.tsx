import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { MainBonusCardType } from '@/lib/api-types-generated';
import { giveBonusCard } from '@/lib/api';
import useSystemStore from '@/stores/systemStore';
import { resetNotificationsQuery } from '@/lib/queryClient';

export default function RollBonusCard() {
  const { myPlayer, setNextTurnState, addCardToState } = usePlayerStore(
    useShallow(state => ({
      myPlayer: state.myPlayer,
      setNextTurnState: state.setNextTurnState,
      addCardToState: state.addCardToState,
    }))
  );

  const handleFinished = async (option: WeightedOption<MainBonusCardType>) => {
    useSystemStore.setState(state => ({
      ...state,
      disableCurrentPlayerQuery: true,
    }));
    const newCard = await giveBonusCard({ bonus_type: option.value });
    addCardToState(newCard);
    setNextTurnState({ skipUpdate: true });
    resetNotificationsQuery();
  };

  const handleClose = async () => {
    useSystemStore.setState(state => ({
      ...state,
      disableCurrentPlayerQuery: false,
    }));
  };

  const getWinnerText = (option: WeightedOption<MainBonusCardType>) => {
    return frontendCardsData[option.value].name;
  };

  const myCurrentCards = myPlayer?.bonus_cards ?? [];
  const myCurrentCardsTypes = myCurrentCards.map(card => card.bonus_type);

  const allCardTypes = Object.keys(frontendCardsData) as MainBonusCardType[];
  const cardTypesForRoll = allCardTypes.filter(cardType => !myCurrentCardsTypes.includes(cardType));

  const weightedOptions = cardTypesForRoll.reduce((acc, cardType) => {
    acc.push({
      value: cardType,
      label: frontendCardsData[cardType].name,
      weight: 1,
      imageUrl: frontendCardsData[cardType].picture,
    });
    return acc;
  }, [] as WeightedOption<MainBonusCardType>[]);

  return (
    <GenericRoller<MainBonusCardType>
      options={weightedOptions}
      header="Ролим бонусную карточку"
      openButtonText="Получить карточку"
      finishButtonText="Закрыть"
      onRollFinish={handleFinished}
      getWinnerText={getWinnerText}
      onClose={handleClose}
    />
  );
}
