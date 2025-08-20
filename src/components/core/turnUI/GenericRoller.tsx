import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import BezierEasing from 'bezier-easing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import ImageLoader from '../ImageLoader';
import { useSound } from '@/hooks/useSound';

import { Volume, X } from '@/components/icons';
import useLocalStorage from '@/hooks/useLocalStorage';
import useSystemStore from '@/stores/systemStore';

const FAST_SPIN_DURATION = 2000;
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

export type WeightedOption<T> = {
  value: T;
  weight: number;
  label: string;
  imageUrl: string;
  variant?: 'positive' | 'negative';
};

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
    return exclude; // If no other options, return the excluded one
  }

  return available[Math.floor(Math.random() * available.length)];
}

type Props<T> = {
  autoOpen?: boolean;
  options: WeightedOption<T>[];
  header: string;
  openButtonText: string;
  finishButtonText: string;
  onRollFinish: (option: WeightedOption<T>) => Promise<void>;
  onClose?: (option: WeightedOption<T>) => void;
  getWinnerText: (option: WeightedOption<T>) => string;
  getSecondaryText?: (option: WeightedOption<T>) => string | undefined;
};

export default function GenericRoller<T>({
  autoOpen,
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
  const { value: isMuted, save: saveMutedState } = useLocalStorage({
    key: 'roller-sound-muted',
    defaultValue: false,
  });
  const { playRandom: playRandomSound, stop: stopSound } = useSound(isMuted, true);

  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [rollPhase, setRollPhase] = useState<'idle' | 'rolling' | 'finished'>('idle');
  const [cardList, setCardList] = useState<WeightedOption<T>[]>([]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const winner = winnerIndex !== null ? cardList[winnerIndex] : null;

  let headerText = header;
  let secondaryText: string | undefined = undefined;

  if (rollPhase === 'rolling') {
    headerText = getWinnerText(cardList[currentCardIndex]);
  }

  if (winner !== null) {
    headerText = getWinnerText(winner);
    secondaryText = getSecondaryText?.(winner);
  }

  const fastRoll = rollOptions.length === 1;

  const {
    mutateAsync: handleRollFinish,
    isPending: isLoading,
    isError,
  } = useMutation({
    mutationFn: onRollFinish,
  });

  function updateTransform() {
    if (rouletteRef.current) {
      rouletteRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  }

  const idleAnimate = useCallback(() => {
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
  }, [rollOptions]);

  const startRollingAnimation = useCallback(() => {
    const easeBackswing = BezierEasing(0.38, 0.96, 0.99, 0.99);
    const easeSpin = BezierEasing(0.06, 0.65, 0.35, 1);
    const easeSettle = BezierEasing(0.4, 0.76, 0.64, 0.94);

    const spinDuration = fastRoll ? FAST_SPIN_DURATION : MIN_SPIN_DURATION + Math.random() * 2000;

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
            return;
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
          animationRef.current = null;
        } else {
          animationRef.current = requestAnimationFrame(animate);
        }
      }

      setCurrentCardIndex(c => {
        const newIndex = Math.floor(-offsetRef.current / CARD_FULL_WIDTH);
        if (newIndex !== c) {
          return newIndex;
        }
        return c;
      });
    }

    function finishAnimation() {
      const indexReal = Math.floor(-offsetRef.current / CARD_FULL_WIDTH);
      // const indexFake = cardList.findIndex(item => item.label.startsWith('Просто не повезло'));
      const index = indexReal;

      setWinnerIndex(index);
      setRollPhase('finished');
      stopSound();
      handleRollFinish(cardList[index]);
      animationRef.current = null;
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [handleRollFinish, cardList, fastRoll, stopSound]);

  const resetState = useCallback(() => {
    const randomCards = generateList(IDLE_CARD_COUNT, rollOptions);
    setCardList(randomCards);
    setRollPhase('idle');
    centerIndexRef.current = Math.floor(IDLE_CARD_COUNT / 2);
    offsetRef.current = -((centerIndexRef.current - 1) * CARD_FULL_WIDTH + CARD_WIDTH / 2);
  }, [rollOptions]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setIsOpen(isOpen);
      if (isOpen) {
        resetState();
      } else {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
        stopSound();
        setWinnerIndex(null);
        animationRef.current = null;
        isIdleRunningRef.current = false;
      }
    },
    [resetState, stopSound]
  );

  useEffect(() => {
    if (autoOpen && !isOpen) {
      resetState();
      setIsOpen(true);
    }
  }, [autoOpen, resetState, isOpen]);

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
  }, [rollPhase, cardList.length, idleAnimate, startRollingAnimation]);

  useEffect(() => {
    if (!isMuted && rollPhase === 'rolling') {
      playRandomSound();
    }
  }, [isMuted, rollPhase, playRandomSound]);

  const handleRollClick = () => {
    useSystemStore.getState().enableQueries(false);

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
        <Button variant="action">{openButtonText}</Button>
      </DialogTrigger>
      <DialogContent
        disableBackdropBlur
        className="flex flex-col items-center justify-center w-full min-w-full h-screen backdrop-blur-sm md:rounded-none m-0 p-0 md:bg-transparent overflow-hidden"
        onEscapeKeyDown={e => {
          if (rollPhase === 'rolling') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="absolute bottom-[70%] max-w-4xl ">
          <DialogTitle className="font-wide-black text-2xl text-center">{headerText}</DialogTitle>
        </DialogHeader>
        <div className="absolute left-1/2">
          <div className="absolute z-20 top-0 -translate-x-1/2 -translate-y-1/2 border-l-[18px] border-r-[18px] border-t-[18px] border-l-transparent border-r-transparent border-primary" />
          <div className="absolute z-20 bottom-0 -translate-x-1/2 translate-y-1/2 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent border-primary" />{' '}
          <div ref={rouletteRef} style={{ gap: `${GAP}px` }} className=" flex items-center">
            {cardList.map((item, idx) => {
              const isWinner = idx === winnerIndex;
              const borderStyle: React.CSSProperties = {};
              if (item.variant === 'positive') {
                borderStyle.border = '2px solid #30D158'; // green
                borderStyle.borderRadius = '10px';
              } else if (item.variant === 'negative') {
                borderStyle.border = '2px solid #FF453A'; // red
                borderStyle.borderRadius = '10px';
              } else {
                borderStyle.borderRadius = '10px';
              }
              return (
                <ImageLoader
                  key={idx}
                  src={item.imageUrl}
                  alt={item.label}
                  className="data-[dimmed=true]:opacity-95 data-[dimmed=true]:brightness-50 transition-all duration-400 ease-in-out"
                  data-dimmed={rollPhase === 'finished' && !isWinner}
                  style={{
                    height: isWinner ? `${CARD_HEIGHT * 1.25}px` : `${CARD_HEIGHT}px`,
                    width: isWinner ? `${CARD_WIDTH * 1.25}px` : `${CARD_WIDTH}px`,
                    transition: 'all 0.4s ease',
                    ...borderStyle,
                  }}
                />
              );
            })}
          </div>
        </div>
        {rollPhase === 'idle' && (
          <Button
            className="absolute w-[300px] rounded-xl bottom-[25%] text-[16px]"
            onClick={handleRollClick}
          >
            Заролить
          </Button>
        )}
        {rollPhase === 'idle' && (
          <Button
            variant="ghost"
            className="absolute rounded-xl top-[25%] right-[25%]"
            onClick={() => handleOpenChange(false)}
          >
            <X style={{ width: 25, height: 25 }} />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className="absolute rounded-xl z-20 bg-white/20 hover:bg-white/10 border-0"
          style={{ top: '65%', right: '20px' }}
          onClick={() => {
            if (!isMuted) {
              stopSound();
            }
            saveMutedState(!isMuted);
          }}
        >
          <Volume muted={isMuted} className="h-4 w-4" />
        </Button>
        {rollPhase === 'finished' && (
          <div className="absolute bottom-[15%] flex flex-col items-center justify-center gap-4">
            {secondaryText && (
              <div className="text-base font-semibold w-200 text-center ">{secondaryText}</div>
            )}
            <Button
              className="w-[300px] rounded-xl"
              loading={isLoading}
              disabled={isError}
              onClick={() => {
                handleOpenChange(false);
                if (winner !== null && onClose) {
                  onClose(winner);
                }
              }}
            >
              {isError ? 'Ошибка' : finishButtonText}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
