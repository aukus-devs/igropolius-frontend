import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import BezierEasing from 'bezier-easing';
import { useEffect, useRef, useState } from 'react';
import { Card, CardFooter } from '../../ui/card';

const MIN_SPIN_DURATION = 12000; // ms
const BACKSWING_DURATION = 600; // ms
const SETTLE_DURATION = 1200; // ms

const CARD_WIDTH = 160; // px
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.4125); // px
const GAP = 8; // px
const CARD_FULL_WIDTH = CARD_WIDTH + GAP; // px
const BACKSWING_OFFSET = 60; // px

const IDLE_CARD_COUNT = 21;
const MIN_CARD_IN_ROLL = 75;

export type WeightedOption<T> = { value: T; weight: number; label: string; imageUrl: string };

function weightedRandom<T>(options: WeightedOption<T>[]): WeightedOption<T> {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let r = Math.random() * totalWeight;
  for (const opt of options) {
    if (r < opt.weight) return opt;
    r -= opt.weight;
  }
  // Fallback, should not happen if weights > 0
  return options[options.length - 1];
}

function generateList<T>(len: number, options: WeightedOption<T>[]): WeightedOption<T>[] {
  if (options.length === 0) {
    throw new Error('Need at least 2 options for neighbor constraint.');
  }
  if (options.length === 1) {
    return Array(len).fill(options[0]);
  }
  const result: WeightedOption<T>[] = [];
  for (let i = 0; i < len; i++) {
    // Filter out the previous item to avoid duplicates
    const available = i === 0 ? options : options.filter(opt => opt.value !== result[i - 1].value);
    if (available.length === 0) {
      throw new Error('No valid options to choose from at position ' + i);
    }
    // Pick a weighted random option from available
    const choice = weightedRandom(available);
    result.push(choice);
  }
  return result;
}

function getRandomExcept<T>(
  options: WeightedOption<T>[],
  exclude: WeightedOption<T>
): WeightedOption<T> {
  if (options.length === 0) {
    throw new Error('Need at least 1 option');
  }

  const available = options.filter(opt => exclude.value !== opt.value);

  if (available.length === 0) {
    throw new Error('No valid options to choose after excluding');
  }

  return available[Math.floor(Math.random() * available.length)];
}

type Props<T> = {
  options: WeightedOption<T>[];
  header: string;
  openButtonText: string;
  finishButtonText: string;
  onRollFinish: (option: WeightedOption<T>) => Promise<void>;
  onClose?: (option: WeightedOption<T>) => Promise<void>;
  getWinnerText: (option: WeightedOption<T>) => string;
  getSecondaryText?: (option: WeightedOption<T>) => string | undefined;
};

export default function GenericRoller<T>({
  options: rollOptions,
  header,
  openButtonText,
  finishButtonText,
  getWinnerText,
  onRollFinish,
  onClose,
  getSecondaryText,
}: Props<T>) {
  const rouletteRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const centerIndexRef = useRef(0);
  const offsetRef = useRef(0);
  const isIdleRunningRef = useRef(false);

  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rollPhase, setRollPhase] = useState<'idle' | 'rolling' | 'finished'>('idle');
  const [cardList, setCardList] = useState<WeightedOption<T>[]>([]);

  const winner = winnerIndex !== null ? cardList[winnerIndex] : null;

  let headerText = header;
  let secondaryText: string | undefined = undefined;
  if (winner !== null) {
    headerText = getWinnerText(winner);
    secondaryText = getSecondaryText?.(winner);
  }

  function updateTransform() {
    if (rouletteRef.current) {
      rouletteRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  }

  const idleAnimate = () => {
    const speed = 1;
    const direction = -1;
    offsetRef.current += speed * direction;
    updateTransform();

    if (-Math.floor(offsetRef.current / CARD_FULL_WIDTH) !== centerIndexRef.current) {
      if (direction < 0) {
        setCardList(prev => [
          ...prev.slice(1),
          getRandomExcept(rollOptions, prev[prev.length - 1]),
        ]);
        offsetRef.current += CARD_FULL_WIDTH;
      } else {
        setCardList(prev => [getRandomExcept(rollOptions, prev[0]), ...prev.slice(0, -1)]);
        offsetRef.current -= CARD_FULL_WIDTH;
      }
    }

    animationRef.current = requestAnimationFrame(idleAnimate);
  };

  function startRollingAnimation() {
    const easeBackswing = BezierEasing(0.38, 0.96, 0.99, 0.99);
    const easeSpin = BezierEasing(0.06, 0.65, 0.35, 1);
    const easeSettle = BezierEasing(0.4, 0.76, 0.64, 0.94);

    const spinDuration = MIN_SPIN_DURATION + Math.random() * 2000;

    let startPosition = offsetRef.current;

    const randomOffset = Math.floor(Math.random() * (CARD_WIDTH + GAP / 2));
    const cardOffset = MIN_CARD_IN_ROLL + Math.floor(Math.random() * 5);
    const endPosition = -CARD_FULL_WIDTH * cardOffset - randomOffset;

    const isOnGap = randomOffset > CARD_WIDTH;

    let phase: 'backswing' | 'spin' | 'settle' = 'backswing';
    let animationStartTime = 0;

    function animate(now: number) {
      if (animationStartTime === 0) {
        animationStartTime = now;
      }

      const elapsed = now - animationStartTime;

      if (phase === 'backswing') {
        const progress = Math.min(elapsed / BACKSWING_DURATION, 1);
        const eased = easeBackswing(progress);

        offsetRef.current = startPosition + BACKSWING_OFFSET * eased;

        updateTransform();

        if (progress >= 1) {
          phase = 'spin';
          animationStartTime = now;
          startPosition += BACKSWING_OFFSET;
        }
        animationRef.current = requestAnimationFrame(animate);
      } else if (phase === 'spin') {
        const progress = Math.min(elapsed / spinDuration, 1);
        const eased = easeSpin(progress);

        offsetRef.current = startPosition + (endPosition - startPosition) * eased;

        updateTransform();

        if (progress >= 1) {
          if (isOnGap) {
            phase = 'settle';
            animationStartTime = now;
          } else {
            finishAnimation();
          }
        }
        animationRef.current = requestAnimationFrame(animate);
      } else if (phase === 'settle') {
        const progress = Math.min(elapsed / SETTLE_DURATION, 1);
        const eased = easeSettle(progress);

        offsetRef.current = endPosition + GAP * eased;
        updateTransform();

        if (progress >= 1) {
          finishAnimation();
        }
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    function finishAnimation() {
      const index = Math.floor(-offsetRef.current / CARD_FULL_WIDTH);
      setWinnerIndex(index);
      setRollPhase('finished');
      onRollFinish(cardList[index]);
      animationRef.current = null;
    }
    animationRef.current = requestAnimationFrame(animate);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const randomCards = generateList(IDLE_CARD_COUNT, rollOptions);
      setCardList(randomCards);
      setRollPhase('idle');
      centerIndexRef.current = Math.floor(IDLE_CARD_COUNT / 2);
      offsetRef.current = -((centerIndexRef.current - 1) * CARD_FULL_WIDTH + CARD_WIDTH / 2);
    } else {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      setWinnerIndex(null);
      animationRef.current = null;
      isIdleRunningRef.current = false;
    }
    setIsOpen(isOpen);
  };

  useEffect(() => {
    if (rollPhase === 'idle' && cardList.length > 0) {
      if (!isIdleRunningRef.current) {
        isIdleRunningRef.current = true;
        animationRef.current = requestAnimationFrame(idleAnimate);
      }
    }
    if (rollPhase === 'rolling' && cardList.length > IDLE_CARD_COUNT) {
      startRollingAnimation();
    }
  }, [cardList, rollPhase]);

  const handleRollClick = () => {
    setRollPhase('rolling');

    const randomCards = generateList(150, rollOptions);
    setCardList(prev => [...prev, ...randomCards]);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">{openButtonText}</Button>
      </DialogTrigger>
      <DialogContent
        className="flex flex-col items-center justify-center w-full min-w-full h-screen md:backdrop-blur-none md:rounded-none m-0 p-0 md:bg-transparent overflow-hidden"
        onEscapeKeyDown={e => {
          if (rollPhase === 'rolling') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="absolute bottom-[70%] max-w-4xl ">
          <DialogTitle className="font-wide-black text-3xl text-center">{headerText}</DialogTitle>
        </DialogHeader>
        <div className="absolute left-1/2">
          <div className="absolute z-20 top-0 -translate-x-1/2 -translate-y-1/2 border-l-[18px] border-r-[18px] border-t-[18px] border-l-transparent border-r-transparent border-primary" />
          <div className="absolute z-20 bottom-0 -translate-x-1/2 translate-y-1/2 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent border-primary" />{' '}
          <div ref={rouletteRef} style={{ gap: `${GAP}px` }} className=" flex items-center">
            {cardList.map((item, idx) => {
              const isWinner = idx === winnerIndex;
              return (
                <Card
                  key={idx}
                  style={{
                    height: isWinner ? `${CARD_HEIGHT * 1.25}px` : `${CARD_HEIGHT}px`,
                    width: isWinner ? `${CARD_WIDTH * 1.25}px` : `${CARD_WIDTH}px`,
                    transition: 'all 0.4s ease',
                  }}
                  className={cn(
                    'overflow-hidden shadow-none relative transition-all duration-300 ease-in-out',
                    {
                      'opacity-95 brightness-50': rollPhase === 'finished' && !isWinner,
                    }
                  )}
                >
                  <img src={item.imageUrl} className="absolute top-0" />
                  <CardFooter className="z-10">{String(item.label)}</CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        {rollPhase === 'idle' && (
          <Button className="z-20 rounded-xl" onClick={handleRollClick}>
            Заролить
          </Button>
        )}
        {rollPhase === 'idle' && (
          <Button
            className="absolute w-[300px] rounded-xl bottom-[25%]"
            onClick={() => handleOpenChange(false)}
          >
            Закрыть
          </Button>
        )}
        {rollPhase === 'finished' && (
          <div className="absolute bottom-[20%] flex flex-col items-center justify-center gap-4">
            {secondaryText && <div className="text-base font-semibold ">{secondaryText}</div>}
            <Button
              className="w-[300px] rounded-xl"
              // disabled={isLoading}
              onClick={async () => {
                if (winner !== null && onClose) {
                  await onClose(winner);
                }
                handleOpenChange(false);
              }}
            >
              {finishButtonText}
              {/* {isLoading && (
              <LoaderCircleIcon color="white" className="animate-spin text-primary" size={24} />
            )} */}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
