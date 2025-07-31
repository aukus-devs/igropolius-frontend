import { useMemo, useState } from 'react';

type Props = {
  initialValue?: number;
  onChange?: (value: number, displayedValue: number) => void;
};

const ITEMS = [...Array(10)];
const ITEM_WIDTH = 44;
const ITEM_HEIGHT = 24;
const GAP = 6;
const ROUNDED = 12;

function Rating({ initialValue = 0, onChange }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const [lockedValue, setLockedValue] = useState(initialValue * 10);
  const [isHovered, setHovered] = useState(false);
  const value = isHovered ? displayValue : lockedValue;
  const finalValue = parseFloat((value / 10).toFixed(1).replace(/\.0$/, ''));
  const color = useMemo(() => getColor(value), [value]);

  function getColor(val: number) {
    if (val <= 25) return 'bg-red-500';
    if (val <= 50) return 'bg-yellow-500';
    if (val <= 75) return 'bg-green-500';
    return 'bg-purple-500';
  }

  function onClick() {
    setLockedValue(Math.round(displayValue));
    onChange?.(finalValue, displayValue);
  }

  function onMouseLeave() {
    setHovered(false);
    setDisplayValue(lockedValue);
  }

  function onMouseEnter() {
    setHovered(true);
  }

  function onMouseMove(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const clampedValue = ((e.clientX - left) / width) * 100;
    setDisplayValue(clampedValue);
  }

  return (
    <div>
      <svg width="0" height="0" className="absolute">
        <mask id="mask">
          {ITEMS.map((_, idx) => (
            <rect
              key={idx}
              x={idx * (ITEM_WIDTH + GAP)}
              width={ITEM_WIDTH}
              height={ITEM_HEIGHT}
              rx={ROUNDED}
              ry={ROUNDED}
              fill="white"
            />
          ))}
        </mask>
      </svg>
      <div className="flex flex-col gap-2.5">
        <div className="font-roboto-wide-semibold">Оценка — {finalValue}</div>
        <button
          className="relative w-fit cursor-pointer border-0 bg-transparent"
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        >
          <div
            className={`absolute z-20 h-full mask-[url(#mask)] mask-intersect mask-alpha mask-repeat-x transition-colors data-[hovered=false]:transition-all data-[hovered=false]:duration-500 ${color}`}
            data-hovered={isHovered}
            style={{ width: `${value}%`, maskSize: `${ITEM_WIDTH}px ${ITEM_HEIGHT}px` }}
          ></div>
          <div
            className="pointer-events-none absolute z-10 h-full w-full bg-popover mask-[url(#mask)] mask-intersect mask-alpha mask-repeat-x transition-all duration-500 data-[disabled=true]:opacity-30"
            style={{ maskSize: `${ITEM_WIDTH}px ${ITEM_HEIGHT}px` }}
            data-disabled={value > 0 && !isHovered}
          ></div>

          <div className="relative z-30 flex gap-1.5">
            {ITEMS.map((_, idx) => (
              <div
                key={idx}
                className="flex justify-center items-center transition-all select-none data-[disabled=true]:opacity-30 font-roboto-wide-semibold-italic text-sm"
                data-disabled={value > 0 && idx >= finalValue && !isHovered}
                style={{ width: `${ITEM_WIDTH}px`, height: `${ITEM_HEIGHT}px` }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
}

export default Rating;
