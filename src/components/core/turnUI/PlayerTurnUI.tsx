import usePlayerStore from '@/stores/playerStore';
import { useShallow } from 'zustand/shallow';
import GameReviewForm from './GameReviewForm';
import RollBonusCard from './RollBonusCard';
import DiceBonusesDialog from './DiceBonusesDialog';
import { MoveButton } from './MoveButton';
import SkipStreetTaxDialog from './SkipStreetTaxDialog';
import SkipMapTaxDialog from './SkipMapTaxDialog';
import SkipPrisonDialog from './SkipPrisonDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoseCardOnDropDialog from './LoseCardDialog';
import PrisonEnterCardRoll from './PrisonEnterCardRoll';
import SelectBuildingSectorDialog from './SelectingBuildingSectorDialog';
import { activateInstantCard, makePlayerMove } from '@/lib/api';
import RollWithInstantCards from './RollWithInstantCards';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import React from 'react';

export default function PlayerTurnUI() {
  const {
    turnState,
    isPlayerMoving,
    hasCardsToSteal,
    prisonHasNoCards,
    myPlayerHasNoCards,
    eventStartTime,
    eventEndTime,
  } = usePlayerStore(
    useShallow(state => {
      const myCardsSet = new Set(state.myPlayer?.bonus_cards.map(card => card.bonus_type) ?? []);
      const otherPlayers = state.players.filter(player => player.id !== state.myPlayerId);
      const cardsToSteal = otherPlayers.flatMap(player =>
        player.bonus_cards.filter(card => !myCardsSet.has(card.bonus_type))
      );
      return {
        turnState: state.turnState,
        isPlayerMoving: state.isPlayerMoving,
        hasCardsToSteal: cardsToSteal.length > 0,
        myPlayerHasNoCards: (state.myPlayer?.bonus_cards.length ?? 0) === 0,
        prisonHasNoCards: state.prisonCards.length === 0,
        eventStartTime: state.eventStartTime,
        eventEndTime: state.eventEndTime,
      };
    })
  );

  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const eventNotStarted = eventStartTime && now < eventStartTime * 1000;
  const eventEnded = eventEndTime && now > eventEndTime * 1000;
  // const timeLeft = eventStartTime ? eventStartTime * 1000 - now : 0;
  // const formatTime = (ms: number) => {
  //   if (ms <= 0) return 'Скоро';
  //   const totalSeconds = Math.floor(ms / 1000);
  //   const minutes = Math.floor(totalSeconds / 60);
  //   const seconds = totalSeconds % 60;
  //   if (minutes > 0) return `${minutes} мин ${seconds} сек`;
  //   return `${seconds} сек`;
  // };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  const disableUI = isPlayerMoving || eventNotStarted || eventEnded;
  if (disableUI) {
    if (eventNotStarted) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto">
              <Button variant="outline" disabled>
                Действия будут доступны с {eventStartTime ? formatDateTime(eventStartTime) : ''}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            Ивент начнётся {eventStartTime ? formatDateTime(eventStartTime) : ''}
          </TooltipContent>
        </Tooltip>
      );
    }
    if (eventEnded) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto">
              <Button variant="outline" disabled>
                Ивент завершён
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">Ивент завершён</TooltipContent>
        </Tooltip>
      );
    }
    return null;
  }

  switch (turnState) {
    case null:
      return null;
    case 'rolling-dice':
      return <MoveButton />;
    // case 'choosing-train-ride':
    //   return <TrainMoveDialog />;
    case 'filling-game-review':
      return (
        <div className="flex gap-4">
          <RollWithInstantCards />
          <GameReviewForm />
        </div>
      );
    case 'rolling-bonus-card':
      return <RollBonusCard />;
    case 'using-dice-bonuses':
      return <DiceBonusesDialog />;
    case 'using-street-tax-bonuses':
      return <SkipStreetTaxDialog />;
    // case 'using-reroll-bonuses':
    //   return <GameRerollDialog />;
    case 'using-prison-bonuses':
      return <SkipPrisonDialog />;
    case 'using-map-tax-bonuses':
      return <SkipMapTaxDialog />;
    case 'using-map-tax-bonuses-after-train-ride':
      return <SkipMapTaxDialog />;
    case 'stealing-bonus-card':
      if (!hasCardsToSteal) {
        return <NoCardsToStealDialog />;
      }
      return null; // No UI for stealing bonus card, handled in PlayerCards
    case 'choosing-building-sector':
      return <SelectBuildingSectorDialog />;
    case 'entering-prison':
      if (myPlayerHasNoCards && prisonHasNoCards) {
        return <NoCardsForPrisonDialog />;
      }
      return <PrisonEnterCardRoll />;

    case 'dropping-card-after-game-drop':
      if (myPlayerHasNoCards) {
        return <NoCardsForDropDialog />;
      }
      return <LoseCardOnDropDialog />;
    case 'dropping-card-after-instant-roll':
      if (myPlayerHasNoCards) {
        return <NoCardsForInstantDropDialog />;
      }
      return <LoseCardOnDropDialog />;
    default: {
      const error: never = turnState;
      throw new Error(`Unknown turn state: ${error}`);
    }
  }
}

function NoCardsToStealDialog() {
  const setNextTurnState = usePlayerStore(state => state.setNextTurnState);
  return (
    <Card className="p-4">
      <span className="font-wide-semibold">
        Сейчас у игроков нет карточек
        <br />
        которые можно своровать
      </span>
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
            await makePlayerMove({ type: 'drop-to-prison', selected_die: null, adjust_by_1: null });
            await moveMyPlayerToPrison();
            await setNextTurnState({});
          }}
        >
          Продолжить
        </Button>
      </div>
    </Card>
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
