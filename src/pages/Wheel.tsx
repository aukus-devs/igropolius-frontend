import { useEffect, useRef, useState, useCallback } from 'react';

type Entry = { label: string; weight?: number; id: string };

type WheelProps = {
  onSpinEnd: (index: string) => void;
  entries: Entry[];
  startOnRender?: boolean;
};

const WHEEL_RADIUS = 200;
const CENTER = { x: 205, y: 205 };
const SPIN_TIME_SECONDS = 6 + Math.random() * 3; // Random spin time between 6 and 9 sec
const pieColors = [
  '#FFCC00',
  '#F72585',
  '#3A86FF',
  '#A1E44D',
  '#FF6B6B',
  '#4ECDC4',
  '#FF9F1C',
  '#9B5DE5',
  '#FB5607',
  '#06D6A0',
  '#FFD166',
  '#00F5D4',
  '#FF6F91',
  '#8AC926',
  '#F4A261',
];

export default function Wheel({ onSpinEnd, entries, startOnRender }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [rotation, setRotation] = useState(Math.random() * 360);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const width = WHEEL_RADIUS * 2 + 10;
  const height = WHEEL_RADIUS * 2 + 10;

  const totalWeight = entries.reduce((sum, e) => sum + (e.weight ?? 1), 0);
  const angles = entries.map(e => ((e.weight ?? 1) / totalWeight) * 360);

  const getCurrentEntry = useCallback(
    (angleDeg: number) => {
      const pointerAngle = 270;
      let accAngle = angleDeg % 360;

      for (let i = 0; i < angles.length; i++) {
        const start = accAngle;
        const end = accAngle + angles[i];
        if (
          (pointerAngle >= start && pointerAngle < end) ||
          (i === angles.length - 1 && pointerAngle >= start)
        ) {
          return entries[i];
        }
        accAngle = (accAngle + angles[i]) % 360;
      }
      return entries[0];
    },
    [angles, entries]
  );

  const drawWheel = useCallback(
    (rotation: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(CENTER.x, CENTER.y);
      ctx.rotate((rotation * Math.PI) / 180);

      let startAngle = 0;
      const winnerFound = winnerId !== null;

      for (let i = 0; i < entries.length; i++) {
        const angle = angles[i];
        const isWinner = winnerId === entries[i].id;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        if (!winnerFound) {
          ctx.fillStyle = pieColors[i % pieColors.length];
        } else {
          ctx.fillStyle = pieColors[i % pieColors.length] + '40';
        }
        if (isWinner) {
          ctx.fillStyle = pieColors[i % pieColors.length];
        }

        ctx.arc(
          0,
          0,
          WHEEL_RADIUS,
          (startAngle * Math.PI) / 180,
          ((startAngle + angle) * Math.PI) / 180
        );
        ctx.closePath();
        ctx.fill();

        // Text
        const midAngle = startAngle + angle / 2;
        const textX = Math.cos((midAngle * Math.PI) / 180) * WHEEL_RADIUS * 0.6;
        const textY = Math.sin((midAngle * Math.PI) / 180) * WHEEL_RADIUS * 0.6;
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate((midAngle * Math.PI) / 180);
        ctx.fillStyle = 'black';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        const labelCut =
          entries[i].label.length > 15 ? entries[i].label.slice(0, 15) + '...' : entries[i].label;
        ctx.fillText(labelCut, 0, 0);
        ctx.restore();

        startAngle += angle;
      }

      ctx.restore();

      // Pointer
      ctx.beginPath();
      ctx.moveTo(CENTER.x, CENTER.y - WHEEL_RADIUS + 27);
      ctx.lineTo(CENTER.x - 27, CENTER.y - WHEEL_RADIUS);
      ctx.lineTo(CENTER.x - 18, CENTER.y - WHEEL_RADIUS - 1);
      ctx.lineTo(CENTER.x, CENTER.y - WHEEL_RADIUS + 17);
      ctx.lineTo(CENTER.x + 18, CENTER.y - WHEEL_RADIUS - 1);
      ctx.lineTo(CENTER.x + 27, CENTER.y - WHEEL_RADIUS);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    },
    [angles, entries, winnerId, width, height]
  );

  const easeOutCirc = (t: number) => 1 - Math.pow(1 - t, 4);

  const spinWheel = () => {
    if (isSpinning) return;
    if (winnerId) return;

    setIsSpinning(true);
    setWinnerId(null);

    const start = rotation;
    const extraSpins = 10 * 360;
    const landing = Math.floor(Math.random() * 360);
    const totalRotation = start + extraSpins + landing;
    const duration = SPIN_TIME_SECONDS * 1000;

    const startTime = performance.now();

    function animate(time: number) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCirc(progress);

      const newRotation = start + (totalRotation - start) * eased;
      setRotation(newRotation);
      drawWheel(newRotation);

      const { label } = getCurrentEntry(newRotation % 360);
      setCurrentLabel(label);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = newRotation % 360;
        setRotation(finalRotation);
        const { id } = getCurrentEntry(finalRotation);
        setWinnerId(id);
        setIsSpinning(false);
        onSpinEnd?.(id);
        drawWheel(finalRotation);
      }
    }

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
      drawWheel(rotation);
      setCurrentLabel(getCurrentEntry(rotation % 360).label);
    }
  }, [drawWheel, rotation, getCurrentEntry]);

  useEffect(() => {
    if (startOnRender) {
      spinWheel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startOnRender]);

  return (
    <div className="flex w-fit flex-col items-center gap-4">
      <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold' }}>
        {currentLabel}
      </div>
      <div className="relative" style={{ width, height }}>
        <div
          className="pointer-events-none absolute z-50 rounded-full border-4 border-white"
          style={{
            width: 410,
            height: 410,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="pointer-events-none absolute z-50 rounded-full border-3 border-black"
          style={{
            width: 403,
            height: 403,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={spinWheel}
          className={`absolute inset-0 ${isSpinning ? 'cursor-progress' : 'cursor-pointer'}`}
        />
      </div>
    </div>
  );
}
