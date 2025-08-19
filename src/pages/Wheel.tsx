import { Button } from '@/components/ui/button';
import { mockHltbGamesList } from '@/lib/mockData';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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
};

const defaultGames = mockHltbGamesList.games.map(game => ({
  id: game.game_id,
  label: game.game_name,
  imageUrl: game.game_image,
  weight: 1,
}));

const degreesToRadians = Math.PI / 180;
const LINE_WIDTH = 7;
const STROKE_COLOR = '#fff'; // '#81a971'
const SIDE_OFFSET = 24;
const SPIN_TIME_SECONDS = 10;

export default function Wheel({ entries = defaultGames, onSpinStart, onSpinEnd }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [radius, setRadius] = useState(0);
  const [rotation, setRotation] = useState(() => Math.random() * 360);
  const [isSpinning, setIsSpinning] = useState(false);

  const easeOutCirc = (t: number) => 1 - Math.pow(1 - t, 4);

  const entriesWithAngles = useMemo(() => {
    if (!entries) return [];

    const totalValue = entries.reduce((acc, cur) => acc + (cur.weight || 1), 0);
    let cumulativeAngle = 0;

    return entries.map(item => {
      const angle = ((item.weight || 1) / totalValue) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      return { ...item, startAngle, endAngle: cumulativeAngle };
    });
  }, [entries]);

  const drawEntry = useCallback(
    (entry: EntryWithAngles, centerX: number, centerY: number, progress: number) => {
      if (!ctxRef.current) return;

      const ctx = ctxRef.current;
      const { imageUrl, startAngle, endAngle } = entry;

      const img = new Image();
      img.src = imageUrl || '';
      img.onload = () => {
        // Create clipping path for this slice
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
        ctx.strokeStyle = STROKE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        ctx.stroke();
      };
    },
    [radius]
  );

  const drawWheel = useCallback(
    (progress = 1) => {
      if (!ctxRef.current || !canvasRef.current) return;

      const ctx = ctxRef.current;
      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      for (const entry of entriesWithAngles) {
        drawEntry(entry, centerX, centerY, progress);
      }
    },
    [entriesWithAngles, drawEntry]
  );

  const getCurrentEntry = (currentRotation: number) => {
    const angle = ((-currentRotation % 360) + 360) % 360;
    return (
      entriesWithAngles.find(item => item.startAngle <= angle && angle < item.endAngle)?.id ?? null
    );
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    onSpinStart?.();

    console.log('starting with', entriesWithAngles);

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
        console.log('ending with', entriesWithAngles);
        if (winner !== null) {
          onSpinEnd?.(winner);
        }
        setIsSpinning(false);
      }
    }

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    ctxRef.current = canvasRef.current.getContext('2d');
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const h = containerRef.current.clientHeight;
    const w = containerRef.current.clientWidth;

    setRadius(Math.floor(Math.min(h, w) / 2.25));
    drawWheel();
  }, [drawWheel]);

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
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-primary"
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
            className="relative select-none"
            style={{ transform: `rotate(${rotation}deg)` }}
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
