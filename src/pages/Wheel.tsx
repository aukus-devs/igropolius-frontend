import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSound } from '@/hooks/useSound';
import { DRUM_SOUND_URL, INDIAN_ROLL_URL } from '@/lib/constants';

type Entry = {
  id: number;
  label: string;
  weight?: number;
  imageUrl?: string;
};
type EntryWithAngles = Entry & { startAngle: number; endAngle: number };

type WheelProps = {
  entries: Entry[];
  startOnRender?: boolean;
  onSpinStart: () => void;
  onSpinEnd: (index: number) => void;
  onSelect?: (id: number) => void;
  highlightedItemId?: number | null;
};

// const defaultGames = mockHltbGamesList.games.map(game => ({
//   id: game.game_id,
//   label: game.game_name,
//   imageUrl: game.game_image,
//   weight: 1,
// }));

const degreesToRadians = Math.PI / 180;
const LINE_WIDTH = 7;
const STROKE_COLOR = '#fff'; // '#81a971'
const STROKE_HIGHLIGHT_COLOR = '#83ab73';
const SIDE_OFFSET = 24;
const SPIN_TIME_SECONDS = 10;

export default function Wheel({
  entries,
  onSpinStart,
  onSpinEnd,
  onSelect,
  highlightedItemId,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [radius, setRadius] = useState(0);
  const [rotation, setRotation] = useState(() => Math.random() * 360);
  const [isSpinning, setIsSpinning] = useState(false);

  const { value: isMuted } = useLocalStorage({ key: 'roller-sound-muted', defaultValue: false });
  const { play: playIndian, stop: stopIndian } = useSound(INDIAN_ROLL_URL, isMuted, true);
  const { play: playDrum, stop: stopDrum } = useSound(DRUM_SOUND_URL, isMuted, true);

  const stopSound = useCallback(() => {
    stopIndian();
    stopDrum();
  }, [stopIndian, stopDrum]);

  const playSound = useCallback(() => {
    const random = Math.random() < 0.5;
    if (random) playIndian();
    else playDrum();
  }, [playIndian, playDrum]);

  const easeOutCirc = (t: number) => 1 - Math.pow(1 - t, 4);

  const entriesWithAnglesRef = useRef<EntryWithAngles[]>([]);

  const [hoveredId, setHoveredId] = useState<number | undefined>(undefined);
  const [imagesMap, setImagesMap] = useState<Record<string, HTMLImageElement>>({});

  const drawEntry = useCallback(
    (
      entry: EntryWithAngles,
      centerX: number,
      centerY: number,
      progress: number,
      isHighlighted: boolean
    ) => {
      if (!ctxRef.current) return;

      const ctx = ctxRef.current;
      const { startAngle, endAngle } = entry;

      const strokeColor = isHighlighted ? STROKE_HIGHLIGHT_COLOR : STROKE_COLOR;

      const img = entry.imageUrl ? imagesMap[entry.imageUrl] : null;

      // Draw slice border first
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        Math.min((radius - SIDE_OFFSET) * progress, radius - SIDE_OFFSET),
        entry.startAngle * degreesToRadians,
        entry.endAngle * degreesToRadians
      );
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = LINE_WIDTH;
      ctx.stroke();

      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          Math.min((radius - SIDE_OFFSET) * progress, radius - SIDE_OFFSET),
          startAngle * degreesToRadians,
          endAngle * degreesToRadians
        );
        ctx.clip();

        const angle = (startAngle + endAngle) / 2;
        const cosMidAngle = Math.cos(angle * degreesToRadians);
        const sinMidAngle = Math.sin(angle * degreesToRadians);
        const imgX = centerX + (cosMidAngle * radius) / 2 - radius / 2;
        const imgY = centerY + (sinMidAngle * radius) / 2 - radius / 2;

        // Rotate image to the center
        ctx.translate(imgX + radius / 2, imgY + radius / 2);
        ctx.rotate((angle + 90) * degreesToRadians);
        ctx.drawImage(img, -radius / 2, -radius / 2, radius, radius);
        ctx.restore();

        // Draw slice border
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          Math.min((radius - SIDE_OFFSET) * progress, radius - SIDE_OFFSET),
          startAngle * degreesToRadians,
          endAngle * degreesToRadians
        );
        ctx.closePath();
        ctx.save();
        if (isHighlighted) {
          ctx.shadowColor = 'yellow';
          ctx.shadowBlur = 10;
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
        ctx.restore();
      }
    },
    [radius, imagesMap]
  );

  const highlightId = hoveredId ?? highlightedItemId;

  const drawWheel = useCallback(
    (progress = 1) => {
      if (!ctxRef.current || !canvasRef.current) return;

      const ctx = ctxRef.current;
      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      for (const entry of entriesWithAnglesRef.current) {
        if (entry.id === highlightId) continue; // Skip hovered entry for now
        drawEntry(entry, centerX, centerY, progress, false);
      }
      if (highlightId !== null) {
        const hoveredEntry = entriesWithAnglesRef.current.find(item => item.id === highlightId);
        if (hoveredEntry) {
          drawEntry(hoveredEntry, centerX, centerY, progress, true);
        }
      }
    },
    [drawEntry, highlightId]
  );

  const getCurrentEntry = (currentRotation: number) => {
    const angle = ((-currentRotation % 360) + 360) % 360;
    return (
      entriesWithAnglesRef.current.find(item => item.startAngle <= angle && angle < item.endAngle)
        ?.id ?? null
    );
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || entriesWithAnglesRef.current.length === 0) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius - SIDE_OFFSET || dist < 20) {
        setHoveredId(undefined);
        return;
      }
      let theta = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (theta < 0) theta += 360;
      theta = (theta - rotation + 90 + 360) % 360;
      const found = entriesWithAnglesRef.current.find(
        item => item.startAngle <= theta && theta < item.endAngle
      );
      // console.log('found', found);
      if (found) {
        setHoveredId(found.id);
      } else {
        setHoveredId(undefined);
      }
    },
    [radius, rotation]
  );

  const handleClick = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      const found = entriesWithAnglesRef.current.find(item => item.id === hoveredId);
      if (found) onSelect?.(found.id);
    },
    [onSelect, hoveredId]
  );

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    onSpinStart?.();

    // console.log('starting with', entriesWithAnglesRef.current);

    const start = Math.random() * 360;
    const extraSpins = 10 * 360;
    const landing = Math.floor(Math.random() * 360);
    const totalRotation = start + extraSpins + landing;
    const duration = SPIN_TIME_SECONDS * 1000;

    const startTime = performance.now();

    function animate(time: number) {
      if (!canvasContainerRef.current) return;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCirc(progress);

      const newRotation = start + (totalRotation - start) * eased;
      setRotation(newRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = newRotation % 360;
        setRotation(finalRotation);
        const winner = getCurrentEntry(finalRotation);
        // console.log('ending', { finalRotation, winner });
        // console.log('ending with', entriesWithAnglesRef.current);
        if (winner !== null) {
          onSpinEnd?.(winner);
        }
        setIsSpinning(false);
        stopSound();
      }
    }

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isSpinning) {
      if (isMuted) stopSound();
      else playSound();
    }
  }, [isMuted, isSpinning, playSound, stopSound]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  useEffect(() => {
    if (!canvasRef.current) return;
    ctxRef.current = canvasRef.current.getContext('2d');
  }, []);

  useEffect(() => {
    if (!entries) {
      entriesWithAnglesRef.current = [];
    } else {
      const totalValue = entries.reduce((acc, cur) => acc + (cur.weight || 1), 0);
      let cumulativeAngle = 0;

      const entriesWithAngles = entries.map(item => {
        const angle = ((item.weight || 1) / totalValue) * 360;
        const startAngle = cumulativeAngle;
        cumulativeAngle += angle;

        return { ...item, startAngle, endAngle: cumulativeAngle };
      });
      entriesWithAnglesRef.current = entriesWithAngles;

      const loadImages = async (entries: EntryWithAngles[]) => {
        const map: Record<string, HTMLImageElement> = {};
        await Promise.all(
          entries.map(
            entry =>
              new Promise<void>(resolve => {
                if (!entry.imageUrl) return resolve();
                const img = new Image();
                img.src = entry.imageUrl;
                img.onload = () => {
                  map[entry.imageUrl!] = img;
                  resolve();
                };
                img.onerror = () => resolve(); // skip broken images
              })
          )
        );
        setImagesMap(map);
      };
      loadImages(entriesWithAngles); // pass your wheel entries here
    }

    if (!containerRef.current) return;

    const h = containerRef.current.clientHeight;
    const w = containerRef.current.clientWidth;

    setRadius(Math.floor(Math.min(h, w) / 2.25));
    drawWheel();
  }, [entries, drawWheel]);

  // const currentItemId = getCurrentEntry(rotation);
  // const currentItem = entries.find(item => item.id === currentItemId);

  return (
    <>
      {/*{currentItem && <div>{currentItem.label}</div>}*/}
      <div
        ref={containerRef}
        className="flex justify-center items-center gap-4 w-full h-full overflow-hidden"
      >
        <div className="relative flex flex-col">
          <svg
            width={64}
            height={64}
            viewBox="0 0 54 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-primary pointer-events-none"
          >
            <path
              d="M27 27 L0 0 L9 -1 L27 17 L45 -1 L54 0 Z"
              fill="black"
              stroke={STROKE_COLOR}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <Button
            variant="action"
            className="absolute top-1/2 left-1/2 -translate-1/2 z-10 rounded-full border-[7px] whitespace-normal w-[120px] h-[120px] font-roboto-wide-semibold text-primary-foreground text-sm disabled:bg-muted disabled:opacity-100"
            style={{ borderColor: STROKE_COLOR }}
            disabled={isSpinning}
            onClick={spinWheel}
          >
            {isSpinning ? (
              <LoaderCircleIcon className="animate-spin text-primary size-12" />
            ) : (
              'Запустить'
            )}
          </Button>
          <div
            ref={canvasContainerRef}
            className="relative select-none cursor-pointer"
            style={{ transform: `rotate(${rotation}deg)` }}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredId(undefined)}
            draggable="false"
          >
            <canvas
              ref={canvasRef}
              className="pointer-events-none rotate-[-90deg]"
              width={radius * 2}
              height={radius * 2}
            ></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
