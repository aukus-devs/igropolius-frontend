import { useState } from "react";
import { Button } from "../ui/button";

type Props = {
  onChange?: (value: number) => void;
};

function Rating({ onChange }: Props) {
  const [value, setValue] = useState(0);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  let color = "bg-purple-500";

  if ((hoverValue || value) < 4) color = "bg-red-500";
  else if ((hoverValue || value) < 7) color = "bg-yellow-500";
  else if ((hoverValue || value) < 9) color = "bg-green-500";

  const renderSector = (index: number) => {
    const ratingValue = index + 1;
    const displayValue = hoverValue !== null ? hoverValue : value;
    const isActive = value === ratingValue || value === ratingValue - 0.5;
    const isFull = displayValue >= ratingValue;
    const isHalf = displayValue >= ratingValue - 0.5;

    return (
      <div
        className={`relative bg-popover transition-all rounded-xl h-full w-11 hover:scale-115 overflow-hidden active:scale-100 ${isActive ? "scale-115" : ""} overflow-hidden`}
      >
        <div className="relative z-20 pointer-events-none w-full h-full flex items-center justify-center">
          {ratingValue}
        </div>
        <div
          className={`absolute left-0 top-0 z-10 w-full h-full ${color} rounded-none transition-colors`}
          style={{ width: isFull ? "100%" : isHalf ? "50%" : "0%" }}
        />
      </div>
    );
  };

  function handleClick(index: number) {
    const newValue = hoverPosition && hoverPosition > 0.5 ? index + 1 : index + 0.5;

    setValue(newValue);
    onChange?.(newValue);
  }

  function handleMouseMove(e: React.MouseEvent, index: number) {
    const starBox = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - starBox.left) / starBox.width;

    setHoverPosition(percent);
    setHoverValue(percent > 0.5 ? index + 1 : index + 0.5);
  }

  return (
    <div className="flex items-center">
      {[...Array(10)].map((_, index) => {
        return (
          <Button
            key={index}
            variant="ghost"
            className="relative px-[3px] py-0 h-6 hover:bg-transparent font-roboto-wide-semibold-italic"
            onClick={() => handleClick(index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseEnter={() => setHoverValue(index + 1)}
            onMouseLeave={() => setHoverValue(null)}
          >
            {renderSector(index)}
          </Button>
        );
      })}
    </div>
  );
}

export default Rating;
