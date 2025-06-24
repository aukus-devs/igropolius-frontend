import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useRef, useState } from "react";
import { frontendCardsData } from "@/lib/mockData";
import { Card, CardFooter } from "../../ui/card";
import { BonusCardType } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";

const ROLLING_TIME_MS = 9000;

export default function RollBonusCard() {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const rouletteContainerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "rolling" | "finished">("idle");
  const [displayedCards, setDisplayedCards] = useState<BonusCardType[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  const { receiveBonusCard, myPlayer } = usePlayerStore(
    useShallow((state) => ({
      receiveBonusCard: state.receiveBonusCard,
      myPlayer: state.myPlayer,
    })),
  );

  const myCurrentCards = myPlayer?.bonus_cards ?? [];
  const myCurrentCardsTypes = myCurrentCards.map((card) => card.bonus_type) as BonusCardType[];

  const allCardTypes = Object.keys(frontendCardsData) as BonusCardType[];
  const cardTypesForRoll = allCardTypes.filter(
    (cardType) => !myCurrentCardsTypes.includes(cardType),
  );

  const winner = winnerIndex ? displayedCards[winnerIndex] : null;

  const cardWidth = 80;
  const cardHeight = Math.floor(cardWidth * 1.4);
  const gap = 8;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const randomCards = generateList(80, cardTypesForRoll);
      setDisplayedCards(randomCards);
      setState("idle");
      setWinnerIndex(null);
    }
    setOpen(isOpen);
  };

  const handleRollClick = () => {
    if (!rouletteRef.current) return;
    setState("rolling");

    const visibleCards = 9;
    const totalCards = displayedCards.length;
    const centerIndex = Math.floor(visibleCards / 2);

    const winIndex =
      Math.floor(Math.random() * visibleCards) + (totalCards - visibleCards * 2);
    setWinnerIndex(winIndex);

    rouletteRef.current.style.transition = "transform 0.4s cubic-bezier(0,.26,.46,3)";
    rouletteRef.current.style.transform = `translateX(15px)`;

    setTimeout(() => {
      if (!rouletteRef.current) return;

      const scrollDistance = (winIndex + 1 - centerIndex) * (cardWidth + gap);

      rouletteRef.current.style.left = `0px`; // No calc() needed
      rouletteRef.current.style.transition = `transform ${ROLLING_TIME_MS}ms cubic-bezier(0.1,.41,.17,1.0)`;
      rouletteRef.current.style.transform = `translateX(-${scrollDistance}px)`;

      setTimeout(() => {
        setState("finished");
      }, ROLLING_TIME_MS);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Зароллить карточку</Button>
      </DialogTrigger>
      <DialogContent style={{ minWidth: "600px" }} className="px-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Роллим бонусную карточку</DialogTitle>
          <DialogDescription className="sr-only">Ролл карточек</DialogDescription>

          <div
            ref={rouletteContainerRef}
            style={{ height: `${cardHeight}px`, justifyContent: "center" }}
            className="flex items-center"
          >
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white z-10" />
            <div ref={rouletteRef} style={{ gap: `${gap}px` }} className="absolute flex">
              {displayedCards.map((item, idx) => {
                const cardData = frontendCardsData[item];
                return (
                  <Card
                    key={idx}
                    style={{ height: `${cardHeight}px`, width: `${cardWidth}px` }}
                    className="overflow-hidden"
                  >
                    <img src={cardData.picture} className="absolute top-0"></img>
                    <CardFooter className="z-10">{cardData.name}</CardFooter>
                  </Card>
                );
              })}
            </div>
            {state === "idle" && (
              <Button variant="secondary" className="z-20" onClick={handleRollClick}>
                Gamba
              </Button>
            )}
            {state === "finished" && winner && (
              <Button
                variant="secondary"
                className="z-20"
                onClick={() => receiveBonusCard(winner)}
              >
                Получить карточку: {winner} <br />
                {frontendCardsData[winner].name}
              </Button>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function generateList<T>(len: number, options: T[]): T[] {
  if (options.length === 0) {
    throw new Error("Need at least 2 options for neighbor constraint.");
  }
  if (options.length === 1) {
    return Array(len).fill(options[0]);
  }
  const result: T[] = [];
  for (let i = 0; i < len; i++) {
    // Filter out the previous item to avoid duplicates
    const available = i === 0 ? options : options.filter((opt) => opt !== result[i - 1]);
    if (available.length === 0) {
      throw new Error("No valid options to choose from at position " + i);
    }
    // Pick a random option from available
    const choice = available[Math.floor(Math.random() * available.length)];
    result.push(choice);
  }
  return result;
}

// Example usage:
// const list = generateList(10, ['A', 'B', 'C']);
// console.log(list);
