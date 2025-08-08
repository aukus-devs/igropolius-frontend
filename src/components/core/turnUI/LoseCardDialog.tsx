import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { activateInstantCard, dropBonusCard, makePlayerMove } from '@/lib/api';
import { InstantCardResult, MainBonusCardType } from '@/lib/api-types-generated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useSystemStore from '@/stores/systemStore';

export default function LoseCardOnDropDialog({
  autoOpen,
  onClose,
}: {
  autoOpen?: boolean;
  onClose?: () => void;
}) {
  const {
    playerCardsOrEmpty,
    moveMyPlayerToPrison,
    setNextTurnState,
    goToPrison,
    removeCardFromState,
    turnState,
  } = usePlayerStore(
    useShallow(state => ({
      playerCardsOrEmpty: state.myPlayer?.bonus_cards,
      moveMyPlayerToPrison: state.moveMyPlayerToPrison,
      setNextTurnState: state.setNextTurnState,
      goToPrison: state.turnState === 'dropping-card-after-game-drop',
      removeCardFromState: state.removeCardFromState,
      turnState: state.turnState,
      sectorId: state.myPlayer?.sector_id,
    }))
  );

  const playerCards = useMemo(() => playerCardsOrEmpty ?? [], [playerCardsOrEmpty]);

  const [rollFinished, setRollFinished] = useState(false);
  const [cardsBeforeDrop, setCardsBeforeDrop] = useState<MainBonusCardType[]>([]);
  const [dropResult, setDropResult] = useState<InstantCardResult | null>(null);

  const options: WeightedOption<MainBonusCardType>[] = useMemo(() => {
    return playerCards.map(card => ({
      label: frontendCardsData[card.bonus_type].name,
      imageUrl: frontendCardsData[card.bonus_type].picture,
      value: card.bonus_type,
      weight: 1,
    }));
  }, [playerCards, autoOpen]);

  const getWinnerText = (option: WeightedOption<MainBonusCardType>) => {
    if (dropResult && rollFinished) {
      if (dropResult === 'card-lost') {
        return `Потеряна карточка ${frontendCardsData[option.value].name}`;
      } else if (dropResult === 'scores-lost') {
        return 'Потеряно 3% от общего счёта';
      } else if (dropResult === 'reroll') {
        return 'Выпавшая карточка не найдена, реролл дропа';
      }
    }
    if (rollFinished) {
      return `Потеряна карточка ${frontendCardsData[option.value].name}`;
    }
    return frontendCardsData[option.value].name;
  };

  const getSecondaryText = (option: WeightedOption<MainBonusCardType>) => {
    return frontendCardsData[option.value].description;
  };

  const handleFinished = async (option: WeightedOption<MainBonusCardType>) => {
    setRollFinished(true);

    setCardsBeforeDrop(playerCards.map(card => card.bonus_type));
    if (goToPrison) {
      await dropBonusCard({ bonus_type: option.value });
      removeCardFromState(option.value);

      const { new_sector_id } = await makePlayerMove({
        type: 'drop-to-prison',
        selected_die: null,
        adjust_by_1: null,
      });

      await setNextTurnState({ sectorToId: new_sector_id, skipUpdate: true });
    } else {
      const result = await activateInstantCard({
        card_type: 'lose-card-or-3-percent',
        card_to_lose: option.value,
      });
      setDropResult(result.result ?? null);
      if (result.result === 'card-lost') {
        removeCardFromState(option.value);
      }
      await setNextTurnState({ skipUpdate: true });
    }
  };

  const handleClose = async () => {
    setDropResult(null);
    setRollFinished(false);
    setCardsBeforeDrop([]);
    onClose?.();
    if (dropResult === 'reroll') {
      useSystemStore.getState().enableQueries(true);
      return;
    }
    if (goToPrison) {
      usePlayerStore.setState(state => ({
        ...state,
        isPlayerMoving: true,
        turnState: null,
      }));
      await moveMyPlayerToPrison();
      usePlayerStore.setState(state => ({
        ...state,
        isPlayerMoving: false,
      }));
      useSystemStore.getState().enableQueries(true);
    } else {
      // drop because of instant card
      useSystemStore.getState().enableQueries(true);
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
      key="lose-card-dialog"
      autoOpen={autoOpen}
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
  const { setNextTurnState, moveMyPlayerToPrison } = usePlayerStore(
    useShallow(state => ({
      setNextTurnState: state.setNextTurnState,
      moveMyPlayerToPrison: state.moveMyPlayerToPrison,
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
            useSystemStore.setState(state => ({
              ...state,
              disablePlayersQuery: true,
            }));
            usePlayerStore.setState(state => ({
              ...state,
              isPlayerMoving: true,
            }));
            const { new_sector_id } = await makePlayerMove({
              type: 'drop-to-prison',
              selected_die: null,
              adjust_by_1: null,
            });
            await setNextTurnState({ sectorToId: new_sector_id });
            await moveMyPlayerToPrison();
            usePlayerStore.setState(state => ({
              ...state,
              isPlayerMoving: false,
            }));
            useSystemStore.setState(state => ({
              ...state,
              disablePlayersQuery: false,
            }));
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
