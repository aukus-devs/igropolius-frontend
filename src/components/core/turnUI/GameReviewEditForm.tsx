import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';

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
import { ArrowRight, Eye, X, Smile, Wand } from '../../icons';
import { searchGames, editPlayerGame } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { FALLBACK_GAME_POSTER } from '@/lib/constants';
import { EditPlayerGame, IgdbGameSummary, PlayerGame } from '@/lib/api-types-generated';
import { parseReview } from '@/lib/textParsing';
import { resetPlayersQuery } from '@/lib/queryClient';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import EmotePanel from './EmotePanel';

function GamePoster({ src }: { src: string }) {
  return (
    <div className="w-32 rounded-md overflow-hidden">
      <img className="h-full object-cover" src={src} />
    </div>
  );
}

function GameReview() {
  const gameReview = useReviewFormStore(state => state.editGameReview);
  const setGameReview = useReviewFormStore(state => state.setEditGameReview);
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
    <div className="relative">
      <div className="relative">
        {showPreview ? (
          <div className="min-h-24 p-3 bg-white/10 rounded-md border border-white/20 text-white">
            {gameReview ? parseReview(gameReview) : 'Комментарий'}
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            className="resize-none h-24 text-[16px]!"
            placeholder="Комментарий"
            value={gameReview}
            onKeyDown={e => e.stopPropagation()}
            onChange={e => setGameReview(e.target.value)}
          />
        )}
      </div>

      <div className="flex justify-end mt-2">
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
      gameTitle: state.editGameTitle,
      setGameTitle: state.setEditGameTitle,
      selectedGame: state.editSelectedGame,
      setSelectedGame: state.setEditSelectedGame,
    }))
  );
  const [showResults, setShowResults] = useState(false);
  const [wasCleared, setWasCleared] = useState(false);

  useEffect(() => {
    if (open) {
      setWasCleared(false);
    }
  }, [open]);

  const gameAlreadySelected = selectedGame && selectedGame.name === gameTitle;

  const gameTitleDebounced = useDebounce(gameTitle, 400);

  const { data: gamesSearchData, isFetching: isSearching } = useQuery({
    queryKey: queryKeys.searchGames(gameTitleDebounced),
    queryFn: () => searchGames(gameTitleDebounced),
    enabled: gameTitleDebounced.length >= 2,
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
        gameTitleDebounced.length >= 2 &&
        !gameAlreadySelected && (
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
  const gameTitle = useReviewFormStore(state => state.editGameTitle);

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

function VodLinks() {
  const vodLinks = useReviewFormStore(state => state.editVodLinks);
  const setVodLinks = useReviewFormStore(state => state.setEditVodLinks);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Ссылки на записи</label>
      <Textarea
        className="resize-none h-20 text-[14px]"
        placeholder="Введите ссылки на записи (каждая с новой строки)"
        value={vodLinks}
        onChange={e => setVodLinks(e.target.value)}
        onKeyDown={e => e.stopPropagation()}
      />
    </div>
  );
}

function GameReviewEditForm({
  showTrigger,
  gameToEdit,
  open: externalOpen,
  setOpen: externalSetOpen,
}: {
  showTrigger?: boolean;
  gameToEdit: PlayerGame;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    open: internalOpen,
    setOpen: internalSetOpen,
    setRating,
    rating,
    error,
    clearError,
    selectedGame,
    setGameTitle,
    setGameReview,
    setGameTime,
    setSelectedGame,
    setVodLinks,
  } = useReviewFormStore(
    useShallow(state => ({
      open: state.open,
      setOpen: state.setOpen,
      setRating: state.setEditRating,
      rating: state.editRating,
      error: state.editError,
      clearError: state.clearEditError,
      selectedGame: state.editSelectedGame,
      setGameTitle: state.setEditGameTitle,
      setGameReview: state.setEditGameReview,
      setGameTime: state.setEditGameTime,
      setSelectedGame: state.setEditSelectedGame,
      setVodLinks: state.setEditVodLinks,
    }))
  );

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalSetOpen || internalSetOpen;

  const { mutateAsync: doEditGame, isPending: isEditing } = useMutation({
    mutationFn: ({ gameId, request }: { gameId: number; request: EditPlayerGame }) =>
      editPlayerGame(gameId, request),
  });

  useEffect(() => {
    if (gameToEdit && open) {
      setGameTitle(gameToEdit.title);
      setGameReview(gameToEdit.review);
      setRating(gameToEdit.rating);
      setVodLinks(gameToEdit.vod_links || '');
      if (gameToEdit.cover) {
        setSelectedGame({
          id: gameToEdit.id,
          name: gameToEdit.title,
          cover: gameToEdit.cover,
          release_year: null,
        });
      }
    }
  }, [gameToEdit, open, setGameTitle, setGameReview, setRating, setVodLinks, setSelectedGame]);

  const isSaveButtonDisabled = useReviewFormStore(state => {
    if (!state.editGameTitle) return true;
    if (state.editGameReview.length === 0) return true;
    if (state.editRating === 0) return true;

    return false;
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
      const { editGameTitle, editGameReview, editVodLinks, editRating, editSelectedGame } =
        useReviewFormStore.getState();
      await doEditGame({
        gameId: gameToEdit.id,
        request: {
          game_title: editGameTitle,
          game_review: editGameReview,
          rating: editRating,
          vod_links: editVodLinks || undefined,
          game_id: editSelectedGame?.id || null,
        },
      });
      resetPlayersQuery();
    } catch (error) {
      console.error('Failed to edit game:', error);
      return;
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline">Редактировать</Button>
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
            <div className="flex gap-2 w-full">
              <div className="flex-1">
                <GameTitle inputRef={inputRef} open={open} />
              </div>
              <HLTBLink />
            </div>

            <div className="font-roboto-wide-semibold">Оценка — {rating}</div>
            <Rating onChange={setRating} initialValue={rating} />
            <GameReview />
            <VodLinks />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive font-medium">{error}</span>}

          <Button
            className="ml-auto w-60"
            disabled={isSaveButtonDisabled}
            onClick={onConfirm}
            loading={isEditing}
          >
            {isEditing ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewEditForm;
