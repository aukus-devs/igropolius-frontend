import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import useReviewFormStore from "@/stores/reviewFormStore";
import Rating from "./Rating";
import { GameLength, GameStatusType } from "@/lib/types";
import { useShallow } from "zustand/shallow";
import usePlayerStore from "@/stores/playerStore";
import { resetCurrentPlayerQuery, resetPlayersQuery } from "@/lib/queryClient";
import { ArrowRight } from "../icons";
import { searchGames, IGDBGame } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const mockPoster = "https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png";

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

function GameTitle() {
  const gameTitle = useReviewFormStore((state) => state.gameTitle);
  const setGameTitle = useReviewFormStore((state) => state.setGameTitle);
  const setSelectedGame = useReviewFormStore((state) => state.setSelectedGame);
  const selectedGame = useReviewFormStore((state) => state.selectedGame);
  
  const [searchResults, setSearchResults] = useState<IGDBGame[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchGamesWithDelay = async () => {
      if (gameTitle.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (selectedGame && selectedGame.name === gameTitle) {
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchGames(gameTitle);
        setSearchResults(response.games);
        setShowResults(true);
      } catch (error) {
        console.error("Failed to search games:", error);
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(searchGamesWithDelay, 300);
    return () => clearTimeout(debounceTimer);
  }, [gameTitle, selectedGame]);

  const handleGameSelect = (game: IGDBGame) => {
    setGameTitle(game.name);
    setSelectedGame(game);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameTitle(e.target.value);
    setSelectedGame(null);
  };

  return (
    <div className="relative">
      <Input
        id="game-name"
        type="text"
        placeholder="Название игры"
        className="font-roboto-wide-semibold bg-white/15 border-transparent"
        value={gameTitle}
        onKeyDown={(e) => e.stopPropagation()}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowResults(false), 150)}
        onFocus={() => searchResults.length > 0 && setShowResults(true)}
      />
      
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleGameSelect(game)}
            >
              <img
                src={game.cover || mockPoster}
                alt={game.name}
                className="w-10 h-14 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{game.name}</div>
                <div className="text-sm text-gray-600">{game.release_year}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isSearching && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
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

  const { setNextTurnState } = usePlayerStore(
    useShallow((state) => ({
      setNextTurnState: state.setNextTurnState,
    })),
  );

  const setRating = useReviewFormStore((state) => state.setRating);
  const rating = useReviewFormStore((state) => state.rating);
  const sendReview = useReviewFormStore((state) => state.sendReview);
  const gameStatus = useReviewFormStore((state) => state.gameStatus);
  const scores = useReviewFormStore(useShallow((state) => state.getReviewScores()));

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

  const selectedGame = useReviewFormStore((state) => state.selectedGame);

  const onConfirm = async () => {
    await sendReview(scores.total);
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
            <GamePoster src={selectedGame?.cover || mockPoster} />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div>
              <GameTitle />
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
        <Popover open={showScoreDetails} onOpenChange={setShowScoreDetails}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              className="justify-self-end"
              disabled={isSendButtonDisabled}
              onClick={onConfirm}
              onMouseEnter={() => setShowScoreDetails(true)}
              onMouseLeave={() => setShowScoreDetails(false)}
            >
              {buttonText}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            Длина игры ({scores.base}) * тип сектора ({scores.sectorMultiplier}) + бонус круга
            ({scores.mapCompletionBonus})
          </PopoverContent>
        </Popover>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewForm;
