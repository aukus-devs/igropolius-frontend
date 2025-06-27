import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useEffect, useRef, useState } from "react";
import { frontendCardsData } from "@/lib/mockData";
import { Card, CardFooter } from "../../ui/card";
import { BonusCardType } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";

const BACKSWING_DURATION = 500;
const SPIN_DURATION = 8000;
const SETTLE_DURATION = 300;
const CARD_WIDTH = 160;
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.4);
const GAP = 8;
const CARD_FULL_WIDTH = CARD_WIDTH + GAP;
const IDLE_CARD_COUNT = 21;

export default function RollBonusCard() {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const centerIndexRef = useRef(0);
  const offsetRef = useRef(0);
  const isIdleRunningRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [rollState, setRollState] = useState<"idle" | "rolling" | "finished">("idle");
  const [cardList, setCardList] = useState<BonusCardType[]>([]);
  const [headerText, setHeaderText] = useState("Роллим бонусную карточку");
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

  function updateTransform() {
    if (rouletteRef.current) {
      rouletteRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  }

  const idleAnimate = () => {
    if (rollState !== "idle") return;

    const speed = 1;
    const direction = -1;
    offsetRef.current = offsetRef.current + speed * direction;

    updateTransform();

    if (-Math.floor(offsetRef.current / CARD_FULL_WIDTH) !== centerIndexRef.current) {
      if (direction < 0) {
        setCardList((prev) => [
          ...prev.slice(1),
          getRandomExcept(cardTypesForRoll, prev[prev.length - 1]),
        ]);
        offsetRef.current += CARD_FULL_WIDTH;
      } else {
        setCardList((prev) => [
          getRandomExcept(cardTypesForRoll, prev[0]),
          ...prev.slice(0, -1),
        ]);
        offsetRef.current -= CARD_FULL_WIDTH;
      }
    }

    animationRef.current = requestAnimationFrame(idleAnimate);
  };

  function easeBackswing(t: number): number {
    //TODO
    return 1 - Math.pow(1 - t, 3);
  }

  function easeSpin(t: number): number {
    //TODO
    return 1 - Math.pow(1 - t, 3);
  }

  function startRollingAnimation(callback?: () => void) {
    if (rollState !== "rolling") return;

    const startOffset = offsetRef.current;
    const backswingOffset = startOffset + 30;

    const posInsideCard = backswingOffset % CARD_FULL_WIDTH;
    const randomOffset = Math.floor(Math.random() * CARD_FULL_WIDTH);

    // const shouldBounce = randomOffset > CARD_WIDTH;

    const endOffset = backswingOffset - posInsideCard - CARD_FULL_WIDTH * 150 - randomOffset;

    let phase: "backswing" | "spin" | "settle" = "backswing";
    let animationStart = 0;

    function animate(now: number) {
      if (animationStart === 0) {
        animationStart = now;
      }

      const elapsed = now - animationStart;

      if (phase === "backswing") {
        const progress = Math.min(elapsed / BACKSWING_DURATION, 1);
        const eased = easeBackswing(progress);

        offsetRef.current = startOffset + (backswingOffset - startOffset) * eased;

        updateTransform();

        if (progress >= 1) {
          phase = "spin";
          animationStart = now;
        }
        animationRef.current = requestAnimationFrame(animate);
      } else if (phase === "spin") {
        const progress = Math.min(elapsed / SPIN_DURATION, 1);
        const eased = easeSpin(progress);

        offsetRef.current = startOffset + (endOffset - startOffset) * eased;

        updateTransform();

        if (progress >= 1) {
          phase = "settle";
          animationStart = now;
        }
        animationRef.current = requestAnimationFrame(animate);
      } else if (phase === "settle") {
        const winnerIndex = Math.floor(-offsetRef.current / CARD_FULL_WIDTH);
        const winnerCard = cardList[winnerIndex];
        const cardInfo = frontendCardsData[winnerCard];
        setHeaderText(`Карточка «${cardInfo.name}»: ${cardInfo.description}`);
        setRollState("finished");
        animationRef.current = null;
        receiveBonusCard(winnerCard);
      }
    }
    animationRef.current = requestAnimationFrame(animate);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const randomCards = generateList(IDLE_CARD_COUNT, cardTypesForRoll);
      setCardList(randomCards);
      setRollState("idle");
      centerIndexRef.current = Math.floor(IDLE_CARD_COUNT / 2);
      offsetRef.current = -((centerIndexRef.current - 1) * CARD_FULL_WIDTH + CARD_WIDTH / 2);
      setHeaderText("Роллим бонусную карточку");
    } else {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = null;
      isIdleRunningRef.current = false;
    }
    setIsOpen(isOpen);
  };

  useEffect(() => {
    if (rollState === "idle" && cardList.length > 0) {
      if (!isIdleRunningRef.current) {
        isIdleRunningRef.current = true;
        animationRef.current = requestAnimationFrame(idleAnimate);
      }
    }
    if (rollState === "rolling" && cardList.length > IDLE_CARD_COUNT) {
      startRollingAnimation();
    }
  }, [cardList, rollState]);

  const handleRollClick = () => {
    setRollState("rolling");

    const randomCards = generateList(150, cardTypesForRoll);
    setCardList((prev) => [...prev, ...randomCards]);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Зароллить карточку</Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col items-center justify-center  w-full  min-w-full backdrop-blur-sm h-full bg-transparent shadow-none"
        onEscapeKeyDown={(e) => {
          if (rollState === "rolling") {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="absolute bottom-[70%] max-w-4xl">
          <DialogTitle className="font-wide-black text-3xl text-center">
            {headerText}
          </DialogTitle>
        </DialogHeader>
        <div className="absolute left-1/2">
          <div className="absolute z-20 top-0 -translate-x-1/2 -translate-y-1/2 border-l-[18px] border-r-[18px] border-t-[18px] border-l-transparent border-r-transparent border-t-red-500" />
          <div className="absolute z-20 bottom-0 -translate-x-1/2 translate-y-1/2 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent border-b-red-500" />{" "}
          <div ref={rouletteRef} style={{ gap: `${GAP}px` }} className=" flex items-center">
            {cardList.map((item, idx) => {
              const cardData = frontendCardsData[item];
              return (
                <Card
                  key={idx}
                  style={{
                    height: `${CARD_HEIGHT}px`,
                    width: `${CARD_WIDTH}px`,
                    transition: "all 0.3s ease",
                  }}
                  className="overflow-hidden shadow-none relative"
                >
                  <img src={cardData.picture} className="absolute top-0" />
                  <CardFooter className="z-10">{item}</CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {rollState === "idle" && (
          <Button variant="secondary" className="z-20 rounded-xl" onClick={handleRollClick}>
            Gamba
          </Button>
        )}

        <Button
          variant="secondary"
          className="absolute w-[300px] rounded-xl bottom-[25%]"
          onClick={() => handleOpenChange(false)}
          disabled={rollState === "rolling"}
        >
          Закрыть
        </Button>
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

function getRandomExcept<T>(options: T[], exclude: T): T {
  if (options.length === 0) {
    throw new Error("Need at least 1 option");
  }

  const available = options.filter((opt) => exclude !== opt);

  if (available.length === 0) {
    throw new Error("No valid options to choose after excluding");
  }

  return available[Math.floor(Math.random() * available.length)];
}

// function getInitialCardCount(): number {
//   let n = Math.ceil(window.innerWidth / (CARD_WIDTH + GAP));
//   return n;
// }
