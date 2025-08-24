import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn, createPortionsRounded } from "@/lib/utils"

type Props = React.ComponentProps<typeof SliderPrimitive.Root> & {
  portionsAmount?: number;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  portionsAmount = 3,
  ...props
}: Props) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  const portions = React.useMemo(() => createPortionsRounded(portionsAmount, min, max), [portionsAmount, min, max]);

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-input relative grow overflow-hidden rounded-sm data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
        <div className="absolute flex justify-between items-center w-full h-full opacity-40 pointer-events-none px-2.5 text-[13px] font-semibold">
          {portions.map((num, idx) => (
            <div key={idx} className="first:justify-start last:justify-end w-0 flex justify-center">
              {num}
            </div>
          ))}
        </div>
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className="group relative block h-7 w-3 shrink-0 disabled:pointer-events-none focus-visible:outline-hidden disabled:opacity-50 cursor-pointer bg-foreground rounded-sm"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
