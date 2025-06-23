import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useState, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import useReviewFormStore from "@/stores/reviewFormStore";
import Rating from "./Rating";
import { GameLength, GameStatusType } from "@/lib/types";
import { useShallow } from "zustand/shallow";
import usePlayerStore from "@/stores/playerStore";
import { queryKeys, resetCurrentPlayerQuery, resetPlayersQuery } from "@/lib/queryClient";
import { ArrowRight, X } from "../icons";
import { searchGames, IGDBGame } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { FALLBACK_GAME_POSTER } from "@/lib/constants";

type StatesOption = {
  title: string;
  value: GameStatusType;
};

function GameStatus() {
  const setGameStatus = useReviewFormStore((state) => state.setGameStatus);
  const options: StatesOption[] = [
    { title: "Прошел", value: "completed" },
    { title: "Дропнул", value: "drop" },
    { title: "Реролл", value: "reroll" },
  ];

  return (
    <Select onValueChange={setGameStatus}>
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
  const setGameTime = useReviewFormStore((state) => state.setGameTime);
  const options: GameTimeOption[] = [
    { title: "2-5 ч.", value: "2-5" },
    { title: "6-10 ч.", value: "5-10" },
    { title: "11-15 ч.", value: "10-15" },
    { title: "16-20 ч.", value: "15-20" },
    { title: "21-25 ч.", value: "20-25" },
    { title: "26+ ч.", value: "25+" },
  ];

  return (
    <Select onValueChange={setGameTime}>
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
  const gameReview = useReviewFormStore((state) => state.gameReview);
  const setGameReview = useReviewFormStore((state) => state.setGameReview);

  return (
    <Textarea
      className="resize-none h-full"
      placeholder="Комментарий"
      value={gameReview}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => setGameReview(e.target.value)}
    />
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
    useShallow((state) => ({
      gameTitle: state.gameTitle,
      setGameTitle: state.setGameTitle,
      selectedGame: state.selectedGame,
      setSelectedGame: state.setSelectedGame,
    })),
  );
  const myPlayer = usePlayerStore((state) => state.myPlayer);
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

  const handleGameSelect = (game: IGDBGame) => {
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
    setGameTitle("");
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
        onKeyDown={(e) => e.stopPropagation()}
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
            onMouseDown={(e) => e.preventDefault()}
          >
            {isSearching && searchResults.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Поиск...
              </div>
            ) : (
              searchResults.map((game) => (
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
  return (
    <Button className="font-semibold border-none py-0 px-9 rounded-md">
      <a
        className="flex gap-1 size-full items-center justify-center"
        href="https://howlongtobeat.com/"
        target="_blank"
      >
        На HLTB <ArrowRight />
      </a>
    </Button>
  );
}

function GameReviewForm() {
  const [open, setOpen] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNextTurnState } = usePlayerStore(
    useShallow((state) => ({
      setNextTurnState: state.setNextTurnState,
    })),
  );

  const {
    setRating,
    rating,
    sendReview,
    getReviewScores,
    gameStatus,
    error,
    clearError,
    isSubmitting,
    selectedGame,
  } = useReviewFormStore(
    useShallow((state) => ({
      setRating: state.setRating,
      rating: state.rating,
      getReviewScores: state.getReviewScores,
      sendReview: state.sendReview,
      gameStatus: state.gameStatus,
      error: state.error,
      clearError: state.clearError,
      isSubmitting: state.isSubmitting,
      selectedGame: state.selectedGame,
    })),
  );
  const scores = getReviewScores();

  let buttonText = "Заполни форму";
  switch (gameStatus) {
    case "completed":
      buttonText = `Получить ${scores.total} очков`;
      break;
    case "drop":
      buttonText = "Дропнуть игру";
      break;
    case "reroll":
      buttonText = "Рерольнуть";
      break;
  }

  const isSendButtonDisabled = useReviewFormStore((state) => {
    if (!state.gameTitle) return true;
    if (!state.gameStatus) return true;
    if (state.gameReview.length === 0) return true;
    if (state.rating === 0) return true;

    if (state.gameStatus === "reroll") return false;
    if (state.gameStatus === "drop") return false;

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
      console.error("Failed to submit review:", error);
      return;
    }

    let turnParams = {};
    switch (gameStatus) {
      case "drop":
        turnParams = { action: "drop-game" };
        break;
      case "reroll":
        turnParams = { action: "reroll-game" };
        break;
    }
    await setNextTurnState(turnParams);
    setOpen(false);
    resetPlayersQuery();
    resetCurrentPlayerQuery();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Оценка игры</Button>
      </DialogTrigger>
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
            <Rating onChange={setRating} />
            <GameReview />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive font-medium">{error}</span>}

          <Popover open={showScoreDetails} onOpenChange={setShowScoreDetails}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className="ml-auto"
                disabled={isSendButtonDisabled || isSubmitting}
                onClick={onConfirm}
                onMouseEnter={() => setShowScoreDetails(true)}
                onMouseLeave={() => setShowScoreDetails(false)}
              >
                {isSubmitting ? "Отправка..." : buttonText}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              Длина игры ({scores.base}) * тип сектора ({scores.sectorMultiplier}) + бонус
              круга ({scores.mapCompletionBonus})
            </PopoverContent>
          </Popover>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewForm;
