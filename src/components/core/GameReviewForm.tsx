import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { ArrowRightIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import useReviewFormStore from "@/stores/reviewFormStore";
import Rating from "./Rating";
import { ScoreByGameLength } from "@/lib/constants";
import { GameLength, GameStatusType } from "@/lib/types";
import { useShallow } from "zustand/shallow";
import usePlayerStore from "@/stores/playerStore";

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
        <SelectValue placeholder="Статус" />
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
        <SelectValue placeholder="Время прохождения" />
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
      className="font-roboto-wide-semibold"
      value={gameTitle}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => setGameTitle(e.target.value)}
    />
  );
}

function HLTBLink() {
  return (
    <Button
      variant="outline"
      className="font-semibold bg-popover text-popover-foreground border-none p-0"
    >
      <a
        className="flex gap-1 size-full items-center justify-center font-roboto-wide-semibold"
        href="https://howlongtobeat.com/"
        target="_blank"
      >
        HLTB <ArrowRightIcon />
      </a>
    </Button>
  );
}

function GameReviewForm() {
  const [open, setOpen] = useState(false);
  const setRating = useReviewFormStore((state) => state.setRating);
  const sendReview = useReviewFormStore((state) => state.sendReview);
  const { buttonText, scores } = useReviewFormStore(
    useShallow((state) => {
      if (state.gameStatus === "completed" && state.gameTime) {
        const scores = ScoreByGameLength[state.gameTime];
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

  const { updateMyScore, setNextTurnState } = usePlayerStore(
    useShallow((state) => ({
      updateMyScore: state.updateMyScore,
      setNextTurnState: state.setNextTurnState,
    })),
  );

  const mockPoster = "https://images.igdb.com/igdb/image/upload/t_cover_big/co9gpd.webp";

  const onConfirm = async () => {
    await sendReview();
    setOpen(false);
    updateMyScore(scores);
    setNextTurnState();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Оценка игры</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-fit justify-end items-end"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Оценка игры</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <GamePoster src={mockPoster} />
            <HLTBLink />
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <GameTitle />
            </div>
            <div className="flex gap-2">
              <GameStatus />
              <GameTime />
            </div>
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
