import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { useState, useEffect, useRef } from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import useReviewFormStore from '@/stores/reviewFormStore';
import Rating from '../Rating';
import { GameLength, GameStatusType } from '@/lib/types';
import { useShallow } from 'zustand/shallow';
import usePlayerStore from '@/stores/playerStore';
import { queryKeys } from '@/lib/queryClient';
import { ArrowRight, X } from '../../icons';
import { searchGames } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { FALLBACK_GAME_POSTER } from '@/lib/constants';
import { calculateGameCompletionScore } from '@/lib/utils';
import { IgdbGameSummary } from '@/lib/api-types-generated';
import EmotePanel from './EmotePanel';
import { parseReview } from '@/lib/textParsing';

type StatesOption = {
  title: string;
  value: GameStatusType;
};

function GameStatus() {
  const { setGameStatus, gameStatus } = useReviewFormStore(
    useShallow(state => ({ setGameStatus: state.setGameStatus, gameStatus: state.gameStatus }))
  );
  const options: StatesOption[] = [
    { title: 'Прошел', value: 'completed' },
    { title: 'Дропнул', value: 'drop' },
    { title: 'Реролл', value: 'reroll' },
  ];

  return (
    <Select onValueChange={setGameStatus} defaultValue={gameStatus ?? undefined}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите исход" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, idx) => (
          <SelectItem key={idx} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GamePoster({ src }: { src: string }) {
  return (
    <div className="w-32 rounded-md overflow-hidden">
      <img className="h-full object-cover" src={src} />
    </div>
  );
}

type GameTimeOption = {
  title: string;
  value: GameLength;
};

function GameTime() {
  const { setGameTime, gameTime } = useReviewFormStore(
    useShallow(state => ({ setGameTime: state.setGameTime, gameTime: state.gameTime }))
  );
  const options: GameTimeOption[] = [
    { title: '2-5 ч.', value: '2-5' },
    { title: '6-10 ч.', value: '5-10' },
    { title: '11-15 ч.', value: '10-15' },
    { title: '16-20 ч.', value: '15-20' },
    { title: '21-25 ч.', value: '20-25' },
    { title: '26+ ч.', value: '25+' },
  ];

  return (
    <Select onValueChange={setGameTime} defaultValue={gameTime ?? undefined}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Время по HLTB" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option, idx) => (
          <SelectItem key={idx} value={option.value}>
            {option.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GameReview() {
  const gameReview = useReviewFormStore(state => state.gameReview);
  const setGameReview = useReviewFormStore(state => state.setGameReview);
  const [showEmotePanel, setShowEmotePanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmoteSelect = (emoteUrl: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = gameReview;

    const newValue =
      currentValue.slice(0, start) + `[7tv]${emoteUrl}[/7tv]` + currentValue.slice(end);
    setGameReview(newValue);

    setShowEmotePanel(false);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + `[7tv]${emoteUrl}[/7tv]`.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSpoilerTag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = gameReview;
    const selectedText = currentValue.slice(start, end);

    let newValue: string;
    let newCursorPos: number;

    if (selectedText) {
      newValue =
        currentValue.slice(0, start) +
        `[spoiler]${selectedText}[/spoiler]` +
        currentValue.slice(end);
      newCursorPos = start + `[spoiler]${selectedText}[/spoiler]`.length;
    } else {
      newValue = currentValue.slice(0, start) + '[spoiler][/spoiler]' + currentValue.slice(end);
      newCursorPos = start + '[spoiler]'.length;
    }

    setGameReview(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div>
      <div className="relative">
        {showPreview ? (
          <div className="min-h-24 p-3 bg-white/10 rounded-md border border-white/20 text-white">
            {gameReview ? parseReview(gameReview) : 'Комментарий'}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            className="resize-none h-24"
            placeholder="Комментарий"
            value={gameReview}
            onKeyDown={e => e.stopPropagation()}
            onChange={e => setGameReview(e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-end mt-2">
        <div className="flex gap-1">
          {!showPreview && (
            <Popover open={showEmotePanel} onOpenChange={setShowEmotePanel}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0 hover:bg-white/20 z-10"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-white/70 hover:text-white"
                      >
                        <path
                          d="M14.8395 1.8335H7.15786C3.8212 1.8335 1.83203 3.82266 1.83203 7.15933V14.8318C1.83203 18.1777 3.8212 20.1668 7.15786 20.1668H14.8304C18.167 20.1668 20.1562 18.1777 20.1562 14.841V7.15933C20.1654 3.82266 18.1762 1.8335 14.8395 1.8335ZM5.92953 7.07683C6.19536 6.811 6.63536 6.811 6.9012 7.07683C7.55203 7.72766 8.61536 7.72766 9.2662 7.07683C9.53203 6.811 9.97203 6.811 10.2379 7.07683C10.5037 7.34266 10.5037 7.78266 10.2379 8.0485C9.64203 8.64433 8.86286 8.93766 8.0837 8.93766C7.30453 8.93766 6.52536 8.64433 5.92953 8.0485C5.6637 7.7735 5.6637 7.34266 5.92953 7.07683ZM10.9987 17.2152C8.53286 17.2152 6.52536 15.2077 6.52536 12.7418C6.52536 12.1002 7.04787 11.5685 7.68953 11.5685H14.2895C14.9312 11.5685 15.4537 12.091 15.4537 12.7418C15.472 15.2077 13.4645 17.2152 10.9987 17.2152ZM16.0679 8.0485C15.472 8.64433 14.6929 8.93766 13.9137 8.93766C13.1345 8.93766 12.3554 8.64433 11.7595 8.0485C11.4937 7.78266 11.4937 7.34266 11.7595 7.07683C12.0254 6.811 12.4654 6.811 12.7312 7.07683C13.382 7.72766 14.4654 7.72766 15.0962 7.07683C15.362 6.811 15.802 6.811 16.0679 7.07683C16.3337 7.34266 16.3337 7.7735 16.0679 8.0485Z"
                          fill="#F2F2F2"
                        />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Смайлы 7TV</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent
                className="w-auto p-0 border-none bg-transparent shadow-none"
                align="end"
                sideOffset={5}
              >
                <EmotePanel onEmoteSelect={handleEmoteSelect} />
              </PopoverContent>
            </Popover>
          )}

          {!showPreview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 hover:bg-white/20 z-10"
                  onClick={handleSpoilerTag}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/70 hover:text-white"
                  >
                    <path
                      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"
                      fill="#F2F2F2"
                    />
                    <line
                      x1="4.93"
                      y1="4.93"
                      x2="19.07"
                      y2="19.07"
                      stroke="#F2F2F2"
                      strokeWidth="2"
                    />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Спойлер</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 hover:bg-white/20 z-10"
                onClick={() => setShowPreview(!showPreview)}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white/70 hover:text-white"
                >
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"
                    fill="#F2F2F2"
                  />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Превью</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function GameTitle({
  inputRef,
  open,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  open: boolean;
}) {
  const { gameTitle, setGameTitle, selectedGame, setSelectedGame } = useReviewFormStore(
    useShallow(state => ({
      gameTitle: state.gameTitle,
      setGameTitle: state.setGameTitle,
      selectedGame: state.selectedGame,
      setSelectedGame: state.setSelectedGame,
    }))
  );
  const myPlayer = usePlayerStore(state => state.myPlayer);
  const [showResults, setShowResults] = useState(false);
  const [wasCleared, setWasCleared] = useState(false);
  const [wasInitialized, setWasInitialized] = useState(false);

  useEffect(() => {
    if (open) {
      setWasInitialized(false);
      setWasCleared(false);
    }
  }, [open]);

  useEffect(() => {
    if (!gameTitle && myPlayer?.current_game && !wasCleared && !wasInitialized) {
      setGameTitle(myPlayer.current_game);
      setWasInitialized(true);
    }
  }, [myPlayer?.current_game, gameTitle, setGameTitle, wasCleared, wasInitialized]);

  const gameAlreadySelected = selectedGame && selectedGame.name === gameTitle;

  const gameTitleDebounced = useDebounce(gameTitle, 400);

  const { data: gamesSearchData, isFetching: isSearching } = useQuery({
    queryKey: queryKeys.searchGames(gameTitleDebounced),
    queryFn: () => searchGames(gameTitleDebounced),
    enabled: gameTitleDebounced.length >= 2 && !gameAlreadySelected,
    initialData: { games: [] },
  });

  const searchResults = gamesSearchData.games;

  const handleGameSelect = (game: IgdbGameSummary) => {
    setGameTitle(game.name);
    setSelectedGame(game);
    setShowResults(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameTitle(e.target.value);
    setSelectedGame(null);
    if (wasCleared) {
      setWasCleared(false);
    }
  };

  const handleClearInput = () => {
    setGameTitle('');
    setSelectedGame(null);
    setShowResults(false);
    setWasCleared(true);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id="game-name"
        type="text"
        placeholder="Название игры"
        className="font-roboto-wide-semibold bg-white/15 border-transparent"
        value={gameTitle}
        onKeyDown={e => e.stopPropagation()}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowResults(false), 150)}
        onFocus={() => setShowResults(true)}
        autoComplete="off"
      />

      {showResults &&
        (searchResults.length > 0 || isSearching) &&
        gameTitleDebounced.length >= 2 && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
            onMouseDown={e => e.preventDefault()}
          >
            {isSearching && searchResults.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Поиск...
              </div>
            ) : (
              searchResults.map(game => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleGameSelect(game)}
                >
                  <img
                    src={game.cover || FALLBACK_GAME_POSTER}
                    alt={game.name}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{game.name}</div>
                    <div className="text-sm text-gray-600">{game.release_year}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      {gameTitle && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="button"
            onClick={handleClearInput}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}

function HLTBLink() {
  const gameTitle = useReviewFormStore(state => state.gameTitle);

  const cleanGameTitle = gameTitle ? gameTitle.replace(/\s*\(\d{4}\)\s*$/, '').trim() : '';

  const hltbUrl = cleanGameTitle
    ? `https://howlongtobeat.com/?q=${encodeURIComponent(cleanGameTitle)}`
    : 'https://howlongtobeat.com/';

  return (
    <Button className="font-semibold border-none py-0 px-9 rounded-md">
      <a
        className="flex gap-1 size-full items-center justify-center"
        href={hltbUrl}
        target="_blank"
      >
        На HLTB <ArrowRight />
      </a>
    </Button>
  );
}

function GameReviewForm({ showTrigger }: { showTrigger?: boolean }) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNextTurnState, myPlayer } = usePlayerStore(
    useShallow(state => ({
      setNextTurnState: state.setNextTurnState,
      myPlayer: state.myPlayer,
    }))
  );

  const {
    open,
    setOpen,
    setRating,
    rating,
    sendReview,
    gameStatus,
    error,
    clearError,
    isSubmitting,
    selectedGame,
    gameLength,
    targetSectorId,
  } = useReviewFormStore(
    useShallow(state => ({
      open: state.open,
      setOpen: state.setOpen,
      setRating: state.setRating,
      rating: state.rating,
      sendReview: state.sendReview,
      gameStatus: state.gameStatus,
      error: state.error,
      clearError: state.clearError,
      isSubmitting: state.isSubmitting,
      selectedGame: state.selectedGame,
      gameLength: state.gameTime,
      targetSectorId: state.targetSectorId,
    }))
  );

  const scores =
    myPlayer && gameStatus
      ? calculateGameCompletionScore({
          gameLength,
          gameStatus,
          sectorId: myPlayer.sector_id,
          mapsCompleted: myPlayer.maps_completed,
        })
      : {
          total: 0,
          base: 0,
          sectorMultiplier: 1,
          mapCompletionBonus: 0,
        };

  let buttonText = 'Заполни форму';
  let buttonColor = 'bg-primary';
  switch (gameStatus) {
    case 'completed':
      buttonText = `Построить и получить ${scores.total} очков`;
      if (targetSectorId) {
        buttonText = `Построить на секторе #${targetSectorId} и получить ${scores.total} очков`;
      }
      buttonColor = 'bg-green-800';
      break;
    case 'drop':
      buttonText = 'Дропнуть игру и отправиться в тюрьму';
      buttonColor = 'bg-red-800';
      break;
    case 'reroll':
      buttonText = 'Рерольнуть';
      buttonColor = 'bg-yellow-800';
      break;
  }

  const isSendButtonDisabled = useReviewFormStore(state => {
    if (!state.gameTitle) return true;
    if (!state.gameStatus) return true;
    if (state.gameReview.length === 0) return true;
    if (state.rating === 0) return true;

    if (state.gameStatus === 'reroll') return false;
    if (state.gameStatus === 'drop') return false;

    // completed
    if (state.gameTime) return false;
    return true;
  });

  useEffect(() => {
    if (open && !selectedGame) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [open, selectedGame]);

  const onConfirm = async () => {
    clearError();

    try {
      await sendReview(scores.total);
    } catch (error) {
      console.error('Failed to submit review:', error);
      return;
    }

    let turnParams = {};
    switch (gameStatus) {
      case 'drop':
        turnParams = { action: 'drop-game' };
        break;
      case 'reroll':
        turnParams = { action: 'reroll-game' };
        break;
    }

    await setNextTurnState(turnParams);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline">Оценка игры</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[790px] p-2.5" aria-describedby="">
        <DialogHeader className="hidden">
          <DialogTitle />
        </DialogHeader>

        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <GamePoster src={selectedGame?.cover || FALLBACK_GAME_POSTER} />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>
              <GameTitle inputRef={inputRef} open={open} />
            </div>

            <div className="flex gap-2 w-full">
              <GameStatus />
              <GameTime />
              <HLTBLink />
            </div>

            <div className="font-roboto-wide-semibold">Оценка — {rating}</div>
            <Rating onChange={setRating} initialValue={rating} />
            <GameReview />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive font-medium">{error}</span>}

          <Popover open={showScoreDetails} onOpenChange={setShowScoreDetails}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className={`ml-auto ${buttonColor}`}
                disabled={isSendButtonDisabled || isSubmitting}
                onClick={onConfirm}
                onMouseEnter={() => setShowScoreDetails(true)}
                onMouseLeave={() => setShowScoreDetails(false)}
              >
                {isSubmitting ? 'Отправка...' : buttonText}
              </Button>
            </PopoverTrigger>
            {gameStatus === 'completed' && (
              <PopoverContent>
                Длина игры ({scores.base}) * тип сектора ({scores.sectorMultiplier}) + бонус круга (
                {scores.mapCompletionBonus})
              </PopoverContent>
            )}
          </Popover>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewForm;
