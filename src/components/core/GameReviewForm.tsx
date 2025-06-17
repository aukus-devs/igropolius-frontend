import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { ArrowRightIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import useReviewFormStore from "@/stores/reviewFormStore";
import Rating from "./Rating";
import { ScoreByGameLength, SectorScoreMultiplier } from "@/lib/constants";
import { GameLength, GameStatusType } from "@/lib/types";
import { useShallow } from "zustand/shallow";
import usePlayerStore from "@/stores/playerStore";
import { resetCurrentPlayerQuery, resetPlayersQuery } from "@/lib/queryClient";
import { SectorsById } from "@/lib/mockData";

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
    <div className="w-32 aspect-[2/3] rounded-md overflow-hidden">
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

  return (
    <Input
      id="game-name"
      type="text"
      placeholder="Название игры"
      className="font-roboto-wide-semibold bg-white/15 border-transparent"
      value={gameTitle}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => setGameTitle(e.target.value)}
    />
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
        На HLTB <ArrowRightIcon />
      </a>
    </Button>
  );
}

function GameReviewForm() {
  const [open, setOpen] = useState(false);

  const { setNextTurnState, myPlayer } = usePlayerStore(
    useShallow((state) => ({
      setNextTurnState: state.setNextTurnState,
      myPlayer: state.myPlayer,
    })),
  );

  const currentSector = myPlayer?.sector_id ? SectorsById[myPlayer.sector_id] : null;

  const setRating = useReviewFormStore((state) => state.setRating);
  const rating = useReviewFormStore((state) => state.rating);
  const sendReview = useReviewFormStore((state) => state.sendReview);

  const { buttonText, scores } = useReviewFormStore(
    useShallow((state) => {
      if (state.gameStatus === "completed" && state.gameTime) {
        const baseScores = ScoreByGameLength[state.gameTime];
        const multiliper = currentSector ? SectorScoreMultiplier[currentSector.type] : 1;
        const scores = baseScores * multiliper;
        return { buttonText: `Получить ${scores} очков`, scores };
      }
      if (state.gameStatus === "drop") {
        return { buttonText: "Дропнуть игру", scores: 0 };
      }
      return { buttonText: "Заполни форму", scores: 0 };
    }),
  );
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

  const mockPoster = "https://images.igdb.com/igdb/image/upload/t_cover_big/co9gpd.webp";

  const onConfirm = async () => {
    await sendReview(scores);
    await setNextTurnState({});
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
            <GamePoster src={mockPoster} />
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
        <Button
          size="sm"
          className="justify-self-end"
          disabled={isSendButtonDisabled}
          onClick={onConfirm}
        >
          {buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default GameReviewForm;
