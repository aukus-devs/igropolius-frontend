import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useRef, useState } from "react";
import { frontendCardsData } from "@/lib/mockData";
import { Card, CardFooter } from "../ui/card";
import { BonusCardType } from "@/lib/types";
import usePlayerStore from "@/stores/playerStore";
import { useShallow } from "zustand/shallow";

const ROLLING_TIME_MS = 9000;

function RollBonusCard() {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const rouletteContainerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [displayedCards, setDisplayedCards] = useState<BonusCardType[]>([]);

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

  const getRandomCard = (): BonusCardType => {
    return cardTypesForRoll[Math.floor(Math.random() * cardTypesForRoll.length)];
  };

  const generateRandomCards = (count: number): BonusCardType[] =>
    Array.from({ length: count }, () => {
      return getRandomCard();
    });

  const cardWidth = 80;
  const cardHeight = Math.floor(cardWidth * 1.4);
  const gap = 8;

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setDisplayedCards(generateRandomCards(9));
      setRolling(false);
    }
    setOpen(isOpen);
  };

  const handleRollClick = () => {
    if (!rouletteRef.current) return;
    setRolling(true);

    const winner = getRandomCard();
    console.log(winner);

    rouletteRef.current.style.transition = "transform 0.4s cubic-bezier(0,.26,.46,3)";
    rouletteRef.current.style.transform = `translateX(15px)`;

    const winnerIndex = Math.floor(Math.random() * 10) + 49;

    const randomItems = generateRandomCards(winnerIndex + 5);

    randomItems[winnerIndex] = winner;
    const newCards = [...displayedCards, ...randomItems];

    const distanceOfRoll =
      (winnerIndex + 1 + Math.floor(displayedCards.length / 2)) * (cardWidth + gap) +
      Math.floor(Math.random() * cardWidth) -
      cardWidth / 2;

    setTimeout(() => {
      if (!rouletteRef.current) return;
      setDisplayedCards(newCards);

      rouletteRef.current.style.left = `calc(50% - ${
        Math.floor(displayedCards.length / 2) * (cardWidth + gap) + cardWidth / 2
      }px)`;

      rouletteRef.current.style.transition = `transform ${ROLLING_TIME_MS}ms cubic-bezier(0.1,.41,.17,1.0)`;
      rouletteRef.current.style.transform = `translateX(-${distanceOfRoll}px)`;

      setTimeout(() => {
        receiveBonusCard(winner);
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
            <Button
              variant="secondary"
              className="z-20"
              onClick={handleRollClick}
              hidden={rolling}
            >
              Gamba
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default RollBonusCard;
