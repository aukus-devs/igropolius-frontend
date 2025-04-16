import { SelectValue } from "@radix-ui/react-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { ArrowRightIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";
import useReviewFormStore from "@/stores/reviewFormStore";
import Rating from "./Rating";

function GameStatus() {
  const setGameStatus = useReviewFormStore((state) => state.setGameStatus);
  const options = ['Прошел', 'Дропнул', 'Реролл'];

  return (
    <Select onValueChange={setGameStatus}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Статус" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function GamePoster({ src }: { src: string }) {
  return (
    <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden">
      <img className="h-full object-cover" src={src} />
    </div>
  )
}

function GameTime() {
  const setGameTime = useReviewFormStore((state) => state.setGameTime);
  const options = ['2-5 ч.', '6-10 ч.', '11-15 ч.', '16-20 ч.', '21-25 ч.', '26+ ч.'];

  return (
    <Select onValueChange={setGameTime}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Время прохождения" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
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
  )
}

function GameTitle() {
  const gameTitle = useReviewFormStore((state) => state.gameTitle);
  const setGameTitle = useReviewFormStore((state) => state.setGameTitle);

  return (
    <Input
      id="game-name"
      type="text"
      placeholder="Название игры"
      value={gameTitle}
      onKeyDown={(e) => e.stopPropagation()}
      onChange={(e) => setGameTitle(e.target.value)}
    />
  )
}

function HLTBLink() {
  return (
    <Button
      variant="link"
      className="font-semibold"
    >
      <a
        className="flex gap-1 items-center justify-center"
        href="https://howlongtobeat.com/"
        target="_blank"
      >
        HLTB <ArrowRightIcon />
      </a>
    </Button>
  )
}

function GameReviewForm() {
  const [open, setOpen] = useState(false);
  const setRating = useReviewFormStore((state) => state.setRating);
  const sendReview = useReviewFormStore((state) => state.sendReview);
  const isSendButtonDisabled = useReviewFormStore((state) => {
    return !state.gameReview
      || !state.gameTitle
      || !state.gameTime
      || !state.gameStatus
      || state.rating === 0;
  });

  const mockPoster = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co9gpd.webp';

  function onConfirm() {
    sendReview();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Оценка игры</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-fit justify-end items-end">
        <DialogHeader>
          <DialogTitle>Новый ход</DialogTitle>
          <DialogDescription className="sr-only">
            Новый ход
          </DialogDescription>
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
            <GameReview />
            <Rating onChange={setRating} />
          </div>
        </div>
        <Button
          size="lg"
          className="justify-self-end"
          disabled={isSendButtonDisabled}
          onClick={onConfirm}
        >
          Кинуть кубики
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default GameReviewForm;
