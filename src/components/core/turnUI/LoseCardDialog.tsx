import GenericRoller, { WeightedOption } from './GenericRoller';
import { useMemo, useState } from 'react';
import { frontendCardsData } from '@/lib/mockData';
import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import { activateInstantCard, dropBonusCard, makePlayerMove } from '@/lib/api';
import { MainBonusCardType, UseInstantCardResponse } from '@/lib/api-types-generated';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useSystemStore from '@/stores/systemStore';
import { getCardDescription } from '@/lib/utils';
import { PRISON_NOTHING_CARD_IMAGE } from '@/lib/constants';

type LoseCardOption = MainBonusCardType | 'nothing';

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
    removeCardFromState,
    turnState,
  } = usePlayerStore(
    useShallow(state => ({
      playerCardsOrEmpty: state.myPlayer?.bonus_cards,
      moveMyPlayerToPrison: state.moveMyPlayerToPrison,
      setNextTurnState: state.setNextTurnState,
      removeCardFromState: state.removeCardFromState,
      turnState: state.turnState,
      sectorId: state.myPlayer?.sector_id,
    }))
  );

  const playerCards = useMemo(() => playerCardsOrEmpty ?? [], [playerCardsOrEmpty]);

  const [rollFinished, setRollFinished] = useState(false);
  const [cardsBeforeDrop, setCardsBeforeDrop] = useState<MainBonusCardType[]>([]);
  const [dropResult, setDropResult] = useState<UseInstantCardResponse | null>(null);

  const options: WeightedOption<LoseCardOption>[] = useMemo(() => {
    const result: WeightedOption<LoseCardOption>[] = [];
    let cardsWeight = 100;
    if (turnState === 'dropping-card-after-police-search') {
      result.push({
        label: 'Ничего не терять',
        imageUrl: PRISON_NOTHING_CARD_IMAGE,
        value: 'nothing',
        weight: 50,
      });
      cardsWeight = 50;
    }

    const cardsAmount = playerCards.length;

    playerCards.forEach(card => {
      result.push({
        label: frontendCardsData[card.bonus_type].name,
        imageUrl: frontendCardsData[card.bonus_type].picture,
        value: card.bonus_type,
        weight: cardsWeight / cardsAmount,
      });
    });
    return result;
  }, [playerCards, turnState]);

  const getWinnerText = (option: WeightedOption<LoseCardOption>) => {
    if (dropResult && rollFinished) {
      if (dropResult.result === 'card-lost' && option.value !== 'nothing') {
        return `Потеряна карточка "${frontendCardsData[option.value].name}"`;
      } else if (dropResult.result === 'score-change') {
        const change = dropResult.score_change || 0;
        if (change > 0) {
          return `Получено +${change}`;
        }
        return `Потеряно ${Math.abs(change)}`;
      } else if (dropResult.result === 'reroll') {
        return 'Выпавшая карточка не найдена, реролл дропа';
      }
    }
    if (rollFinished && option.value !== 'nothing') {
      return `Потеряна карточка "${frontendCardsData[option.value].name}"`;
    }
    if (option.value === 'nothing') {
      return 'Получить очки';
    }
    return frontendCardsData[option.value].name;
  };

  const getSecondaryText = (option: WeightedOption<LoseCardOption>) => {
    if (option.value === 'nothing') {
      return '';
    }
    return getCardDescription(frontendCardsData[option.value]);
  };

  // const gotoPrison = turnState === 'dropping-card-after-game-drop';

  const handleFinished = async (option: WeightedOption<LoseCardOption>) => {
    setRollFinished(true);

    setCardsBeforeDrop(playerCards.map(card => card.bonus_type));

    if (option.value === 'nothing') {
      const result = await activateInstantCard({
        card_type: 'police-search',
        card_to_lose: null,
      });
      setDropResult(result);
      await setNextTurnState({ skipUpdate: true });
      return;
    }

    switch (turnState) {
      case 'dropping-card-after-game-drop': {
        await dropBonusCard({ bonus_type: option.value });
        removeCardFromState(option.value);

        const { new_sector_id } = await makePlayerMove({
          type: 'drop-to-prison',
          selected_die: null,
          adjust_by_1: null,
        });

        await setNextTurnState({ sectorToId: new_sector_id, skipUpdate: true });
        return;
      }
      case 'dropping-card-after-instant-roll': {
        const result = await activateInstantCard({
          card_type: 'lose-card-or-3-percent',
          card_to_lose: option.value,
        });
        setDropResult(result);
        if (result.result === 'card-lost') {
          removeCardFromState(option.value);
        }
        await setNextTurnState({ skipUpdate: true });
        return;
      }
      case 'dropping-card-after-police-search': {
        const result = await activateInstantCard({
          card_type: 'police-search',
          card_to_lose: option.value,
        });
        setDropResult(result);
        if (result.result === 'card-lost') {
          removeCardFromState(option.value);
        }
        await setNextTurnState({ skipUpdate: true });
        return;
      }
    }
  };

  const handleClose = async () => {
    setDropResult(null);
    setRollFinished(false);
    setCardsBeforeDrop([]);
    onClose?.();
    if (dropResult?.result === 'reroll') {
      useSystemStore.getState().enableQueries(true);
      return;
    }
    switch (turnState) {
      case 'dropping-card-after-game-drop': {
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
        return;
      }
      case 'dropping-card-after-instant-roll': {
        // drop because of instant card
        useSystemStore.getState().enableQueries(true);
        return;
      }
      case 'dropping-card-after-police-search': {
        useSystemStore.getState().enableQueries(true);
        return;
      }
    }
  };

  let buttonText = 'Закрыть';
  if (turnState === 'dropping-card-after-game-drop') {
    buttonText = 'Пойти в тюрьму';
  }
  if (dropResult?.result === 'reroll') {
    buttonText = 'Реролл';
  }

  if (playerCards.length === 0 && cardsBeforeDrop.length === 0) {
    switch (turnState) {
      case 'dropping-card-after-instant-roll':
        return <NoCardsForInstantDropDialog />;
      case 'dropping-card-after-game-drop':
        return <NoCardsForDropDialog />;
      case 'entering-prison':
        return <NoCardsForPrisonDialog />;
    }
    return <div>Ошибка!</div>;
  }

  return (
    <GenericRoller<LoseCardOption>
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
