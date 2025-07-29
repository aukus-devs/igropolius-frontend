import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { activateInstantCard, dropBonusCard, makePlayerMove } from '@/lib/api';
import { InstantCardResult, MainBonusCardType } from '@/lib/api-types-generated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoseCardOnDropDialog() {
  const {
    playerCards,
    moveMyPlayerToPrison,
    setNextTurnState,
    goToPrison,
    removeCardFromState,
    turnState,
    sectorId,
  } = usePlayerStore(
    useShallow(state => ({
      playerCards: state.myPlayer?.bonus_cards || [],
      moveMyPlayerToPrison: state.moveMyPlayerToPrison,
      setNextTurnState: state.setNextTurnState,
      goToPrison: state.turnState === 'dropping-card-after-game-drop',
      removeCardFromState: state.removeCardFromState,
      turnState: state.turnState,
      sectorId: state.myPlayer?.sector_id,
    }))
  );

  const [cardsBeforeDrop, setCardsBeforeDrop] = useState<MainBonusCardType[]>([]);
  const [dropResult, setDropResult] = useState<InstantCardResult | null>(null);

  const options: WeightedOption<MainBonusCardType>[] = useMemo(() => {
    return playerCards.map(card => ({
      label: frontendCardsData[card.bonus_type].name,
      imageUrl: frontendCardsData[card.bonus_type].picture,
      value: card.bonus_type,
      weight: 1,
    }));
  }, [playerCards]);

  const getWinnerText = (option: WeightedOption<MainBonusCardType>) => {
    return `Карточка "${frontendCardsData[option.value].name}" сгорает`;
  };

  const handleFinished = async (option: WeightedOption<MainBonusCardType>) => {
    setCardsBeforeDrop(playerCards.map(card => card.bonus_type));
    if (goToPrison) {
      await dropBonusCard({ bonus_type: option.value });
      removeCardFromState(option.value);
    } else {
      const result = await activateInstantCard({
        card_type: 'lose-card-or-3-percent',
        card_to_lose: option.value,
      });
      setDropResult(result.result ?? null);
      if (result.result === 'card-lost') {
        removeCardFromState(option.value);
      }
    }
  };

  const getSecondaryText = () => {
    if (dropResult) {
      if (dropResult === 'card-lost') {
        return 'Карточка потеряна';
      } else if (dropResult === 'scores-lost') {
        return 'Потеряно 3% от общего счёта';
      } else if (dropResult === 'reroll') {
        return 'Реролл дропа';
      }
    }
    return undefined;
  };

  const handleClose = async () => {
    // TODO if page refershes before we lose context
    setDropResult(null);
    if (dropResult === 'reroll') {
      return;
    }
    if (goToPrison) {
      await moveMyPlayerToPrison();
      await setNextTurnState({ prevSectorId: sectorId });
    } else {
      await setNextTurnState({});
    }
  };

  let buttonText = 'Закрыть';
  if (goToPrison) {
    buttonText = 'Пойти в тюрьму';
  }
  if (dropResult === 'reroll') {
    buttonText = 'Реролл';
  }

  if (playerCards.length === 0 && cardsBeforeDrop.length === 0) {
    if (turnState === 'dropping-card-after-instant-roll') {
      return <NoCardsForInstantDropDialog />;
    }
    if (turnState === 'dropping-card-after-game-drop') {
      return <NoCardsForDropDialog />;
    }
    if (turnState === 'entering-prison') {
      return <NoCardsForPrisonDialog />;
    }
    return <div>Ошибка!</div>;
  }

  return (
    <GenericRoller<MainBonusCardType>
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

function NoCardsForInstantDropDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Нет карточек для дропа</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={async () => {
            await activateInstantCard({
              card_type: 'lose-card-or-3-percent',
            });
            await setNextTurnState({});
          }}
        >
          Потерять 3% очков
        </Button>
      </div>
    </Card>
  );
}

function NoCardsForDropDialog() {
  const { setNextTurnState, moveMyPlayerToPrison, sectorId } = usePlayerStore(
    useShallow(state => ({
      setNextTurnState: state.setNextTurnState,
      moveMyPlayerToPrison: state.moveMyPlayerToPrison,
      sectorId: state.myPlayer?.sector_id,
    }))
  );
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">Нет карточек для дропа</span>
      <div className="flex justify-evenly mt-2 gap-2">
        <Button
          variant="outline"
          className="bg-[#0A84FF] hover:bg-[#0A84FF]/70 w-full flex-1"
          onClick={async () => {
            await makePlayerMove({ type: 'drop-to-prison', selected_die: null, adjust_by_1: null });
            await moveMyPlayerToPrison();
            await setNextTurnState({ prevSectorId: sectorId });
          }}
        >
          Продолжить
        </Button>
      </div>
    </Card>
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
          Продолжить
        </Button>
      </div>
    </Card>
  );
}
