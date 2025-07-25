import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GenericRoller, { WeightedOption } from './GenericRoller';
import { MainBonusCardType } from '@/lib/api-types-generated';

export default function RollBonusCard() {
  const { receiveBonusCard, myPlayer, setNextTurnState } = usePlayerStore(
    useShallow(state => ({
      receiveBonusCard: state.receiveBonusCard,
      myPlayer: state.myPlayer,
      setNextTurnState: state.setNextTurnState,
    }))
  );

  const handleFinished = (option: WeightedOption<MainBonusCardType>) => {
    return receiveBonusCard(option.value, false);
  };

  const handleClose = () => {
    return setNextTurnState({});
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
