'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-[#4B4B4B] data-[state=unchecked]:bg-[#4B4B4B] focus-visible:border-ring inline-flex h-[19px] w-10 shrink-0 items-center rounded-full transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-primary data-[state=unchecked]:bg-[#9F9F9F] pointer-events-none block w-[22px] h-[15px] rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-7px)] data-[state=unchecked]:translate-x-[3px]'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
