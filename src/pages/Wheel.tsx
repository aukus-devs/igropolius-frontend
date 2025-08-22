import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSound } from '@/hooks/useSound';

type Entry = {
  id: number;
  label: string;
  weight?: number;
  imageUrl?: string;
};
type EntryWithAngles = Entry & { startAngle: number; endAngle: number };

type WheelProps = {
  entries: Entry[];
  spinTimeSeconds?: number;
  highlightedItemId?: number | null;
  onSpinStart: () => void | boolean | Promise<void | boolean>;
  onSpinEnd: (index: number) => void;
  onSelect?: (id: number) => void;
};

const degreesToRadians = Math.PI / 180;
const LINE_WIDTH = 5;
const STROKE_COLOR = '#2e1801';
const STROKE_HIGHLIGHT_COLOR = '#fd8c2a';
const SIDE_OFFSET = 26; // для картинки обводки
const OUTLINE_SIZE = 2;
const wheelOutlineImage = `${import.meta.env.BASE_URL}assets/wheel/wheel_gold_small.png`;
const wheelPointerImage = `${import.meta.env.BASE_URL}assets/wheel/pointer_gold.png`;

export default function Wheel({
  entries,
  spinTimeSeconds = 10,
  highlightedItemId,
  onSpinStart,
  onSpinEnd,
  onSelect,
}: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  const [radius, setRadius] = useState(0);
  const [rotation, setRotation] = useState(() => Math.random() * 360);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);

  const { value: isMuted } = useLocalStorage({ key: 'roller-sound-muted', defaultValue: false });
  const { playRandom, stop: stopSound } = useSound(isMuted, true);

  const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
  // const easeOutCirc = (t: number) => 1 - Math.pow(1 - t, 4);

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
          ctx.shadowColor = 'gold';
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
      if (dist > radius + SIDE_OFFSET + OUTLINE_SIZE || dist < 20) {
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

  const spinWheel = async () => {
    if (isSpinning || isPreparing) return;

    try {
      setIsPreparing(true);
      const canStart = await onSpinStart?.();
      if (!canStart) {
        return;
      }
    } catch {
      return;
    } finally {
      setIsPreparing(false);
    }

    setIsSpinning(true);

    // console.log('starting with', entriesWithAnglesRef.current);

    const start = Math.random() * 360;
    const extraSpins = spinTimeSeconds * 360;
    const landing = Math.floor(Math.random() * 360);
    const totalRotation = start + extraSpins + landing;
    const duration = spinTimeSeconds * 1000;

    const startTime = performance.now();

    function animate(time: number) {
      if (!canvasContainerRef.current) return;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutSine(progress);

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
      else playRandom();
    }
  }, [isMuted, isSpinning, playRandom, stopSound]);

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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

      const hasNewImages = entriesWithAngles.some(
        entry => entry.imageUrl && !imagesMap[entry.imageUrl]
      );
      if (hasNewImages) {
        loadImages(entriesWithAngles);
      }
    }

    onResize();
    if (radius > 0) drawWheel();
  }, [entries, radius, drawWheel]);

  function onResize() {
    if (!containerRef.current) return;

    const h = containerRef.current.clientHeight;
    const w = containerRef.current.clientWidth;

    setRadius(Math.floor(Math.min(h, w) / 2.25));
  }

  // const currentItemId = getCurrentEntry(rotation);
  // const currentItem = entries.find(item => item.id === currentItemId);

  return (
    <>
      {/*{currentItem && <div>{currentItem.label}</div>}*/}
      <div
        ref={containerRef}
        className="relative flex justify-center items-center gap-4 w-full h-[512px] lg:h-full"
      >
        <div className="relative flex flex-col">
          {/* Фризит анимацию кручения, если консоль открыта */}
          {/* Так же некорректно скейлится относительно колеса, но не критично */}
          <div className="absolute top-1/2 left-1/2 -translate-1/2 z-10 pointer-events-none w-full h-full">
            <img className="w-full" src={wheelOutlineImage} alt="wheel background" />
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <img className="w-full" src={wheelPointerImage} alt="wheel pointer" />
          </div>
          {/* */}

          <Button
            className="absolute top-1/2 left-1/2 -translate-1/2 z-20 rounded-full whitespace-normal w-[120px] h-[120px] font-roboto-wide-semibold text-sm disabled:opacity-100 bg-wheel-primary text-muted hover:bg-amber-600"
            style={{ border: `${LINE_WIDTH}px solid ${STROKE_COLOR}` }}
            disabled={isSpinning || isPreparing}
            onClick={spinWheel}
          >
            {isSpinning || isPreparing ? (
              <LoaderCircleIcon className="animate-spin size-12 text-muted" />
            ) : (
              'Крутить'
            )}
          </Button>
          <div
            ref={canvasContainerRef}
            className="relative select-none cursor-pointer rounded-full z-10"
            style={{ transform: `rotate(${rotation}deg) translateZ(0)` }}
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
