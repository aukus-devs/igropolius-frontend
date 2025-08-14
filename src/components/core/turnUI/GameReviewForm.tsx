import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { useState, useEffect, useRef } from 'react';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import useReviewFormStore from '@/stores/reviewFormStore';
import Rating from '../Rating';
import { useShallow } from 'zustand/shallow';
import usePlayerStore from '@/stores/playerStore';
import { queryKeys } from '@/lib/queryClient';
import { ArrowRight, Share, Smile, Eye, Wand, X, InfoCircle } from '../../icons';
import { searchGames, fetchGameDuration } from '@/lib/api';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { FALLBACK_GAME_POSTER } from '@/lib/constants';
import { calculateGameCompletionScore, extract7tvEmoteId, formatMs } from '@/lib/utils';
import {
  GameCompletionType,
  GameLength,
  IgdbGameSummary,
  Duration,
} from '@/lib/api-types-generated';
import EmotePanel from './EmotePanel';
import { parseReview } from '@/lib/textParsing';
import ImageLoader from '../ImageLoader';

type StatesOption = {
  title: string;
  value: GameCompletionType;
};

function GameStatus({ gameDuration }: { gameDuration?: Duration }) {
  const { setGameStatus, gameStatus } = useReviewFormStore(
    useShallow(state => ({ setGameStatus: state.setGameStatus, gameStatus: state.gameStatus }))
  );
  const options: StatesOption[] = [
    {
      title: gameDuration ? `Прошёл за — ${formatMs(gameDuration * 1000)}` : 'Прошёл',
      value: 'completed',
    },
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
    <ImageLoader
      src={src}
      alt="Game poster"
      className="min-w-[120px] w-[120px] h-[159px] rounded-md overflow-hidden"
    />
  );
}

type GameTimeOption = {
  title: string;
  value: GameLength;
};

function GameTime() {
  const { setGameTime, gameTime, gameStatus } = useReviewFormStore(
    useShallow(state => ({
      setGameTime: state.setGameTime,
      gameTime: state.gameTime,
      gameStatus: state.gameStatus,
    }))
  );
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const options: GameTimeOption[] = [
    { title: '2-5 ч.', value: '2-5' },
    { title: '6-10 ч.', value: '5-10' },
    { title: '11-15 ч.', value: '10-15' },
    { title: '16-20 ч.', value: '15-20' },
    { title: '21-25 ч.', value: '20-25' },
    { title: '26+ ч.', value: '25+' },
  ];

  const handleValueChange = (value: GameLength) => {
    setGameTime(value);
    setTooltipOpen(false);
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  };

  return (
    <Select
      onValueChange={handleValueChange}
      defaultValue={gameTime ?? undefined}
      disabled={gameStatus !== 'completed'}
    >
      <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <TooltipTrigger asChild>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Время по HLTB" />
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent>
          Если игра пройдена более чем в 2 раза быстрее, чем на HLTB,
          <br />
          пересчитайте время по формуле: (время HLTB + ваше время прохождения) / 2
        </TooltipContent>
      </Tooltip>
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

function GameReview({ gameDuration }: { gameDuration?: Duration }) {
  const gameReview = useReviewFormStore(state => state.gameReview);
  const setGameReview = useReviewFormStore(state => state.setGameReview);
  const [showEmotePanel, setShowEmotePanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmoteSelect = (emoteUrl: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const emoteId = extract7tvEmoteId(emoteUrl);
    if (!emoteId) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = gameReview;

    const newValue =
      currentValue.slice(0, start) + `[7tv]${emoteId}[/7tv]` + currentValue.slice(end);
    setGameReview(newValue);

    setShowEmotePanel(false);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + `[7tv]${emoteId}[/7tv]`.length;
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
    <div className="relative">
      <div className="relative">
        {showPreview ? (
          <div className="min-h-24 p-3 bg-white/10 rounded-md border border-white/20 text-white">
            {gameReview ? parseReview(gameReview) : 'Комментарий'}
          </div>
        ) : (
          <Textarea
            id="game-review"
            ref={textareaRef}
            className="resize-none h-24 text-[16px]!"
            placeholder="Комментарий"
            value={gameReview}
            onKeyDown={e => e.stopPropagation()}
            onChange={e => setGameReview(e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex-1">
          <GameDurationInfo gameDuration={gameDuration} />
        </div>

        <div className="flex">
          {!showPreview && (
            <Popover open={showEmotePanel} onOpenChange={setShowEmotePanel}>
              <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Smile className="size-[22px]" />
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
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSpoilerTag}>
                  <Wand className="size-[22px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Спойлер</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="size-[22px]" />
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

function GameDurationInfo({ gameDuration }: { gameDuration?: Duration }) {
  const gameStatus = useReviewFormStore(state => state.gameStatus);

  if (gameStatus !== 'completed' || !gameDuration) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <InfoCircle className="size-[17px] text-white/60" />
      <span className="text-sm text-white/60">
        Время «Прошел за» примерное, и высчитывается по категории стрима
      </span>
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
                  <ImageLoader
                    src={game.cover || FALLBACK_GAME_POSTER}
                    alt={game.name}
                    className="w-10 h-14 rounded overflow-hidden"
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

  const handleClick = () => {
    window.open(hltbUrl, '_blank');
  };

  return (
    <Button className="font-semibold border-none py-0 px-9 rounded-md" onClick={handleClick}>
      <span className="flex gap-1 items-center">
        На HLTB <ArrowRight />
      </span>
    </Button>
  );
}

function GameReviewForm({ showTrigger }: { showTrigger?: boolean }) {
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
    }))
  );

  const { data: gameDurationData } = useQuery({
    queryKey: queryKeys.gameDuration(selectedGame?.name),
    queryFn: () => fetchGameDuration({ game_name: selectedGame!.name }),
    enabled: !!selectedGame?.id,
  });

  const { mutateAsync: doSendReview, isPending: isLoading } = useMutation({
    mutationFn: sendReview,
  });

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
      await doSendReview();
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
          <Button variant="action">Оценка игры</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[790px] p-2.5" aria-describedby="">
        <DialogHeader className="hidden">
          <DialogTitle />
        </DialogHeader>

        <div className="flex gap-4">
          <GamePoster src={selectedGame?.cover || FALLBACK_GAME_POSTER} />

          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <GameTitle inputRef={inputRef} open={open} />
              </div>
              <HLTBLink />
            </div>

            <div className="flex gap-2 w-full">
              <GameStatus gameDuration={gameDurationData?.duration} />
              {gameStatus === 'completed' && <GameTime />}
            </div>

            <Rating onChange={setRating} initialValue={rating} />
            <GameReview gameDuration={gameDurationData?.duration} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive font-medium">{error}</span>}

          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                className="ml-auto w-60"
                disabled={isSendButtonDisabled || isSubmitting}
                onClick={onConfirm}
                loading={isLoading || isSubmitting}
              >
                <ButtonText gameStatus={gameStatus} scores={scores.total} />
              </Button>
            </TooltipTrigger>
            {gameStatus === 'completed' && (
              <TooltipContent sideOffset={8}>
                Длина игры ({scores.base}) * тип сектора ({scores.sectorMultiplier}) + бонус круга (
                {scores.mapCompletionBonus})
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewForm;

function ButtonText({
  gameStatus,
  scores,
}: {
  gameStatus: GameCompletionType | null;
  scores: number;
}) {
  switch (gameStatus) {
    case 'completed':
      return (
        <div className="flex items-center">
          Получить {scores}
          <Share />
        </div>
      );
    case 'drop':
      return 'Дропнуть';
    case 'reroll':
      return 'Рерольнуть';
    default:
      return 'Заполни форму';
  }
}
