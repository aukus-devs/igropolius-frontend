import { Stats } from '@react-three/drei';
import { useRef } from 'react';

export default function FPSCounter() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={container}
        className="absolute bottom-[74px] right-[25px] h-[13px] scale-123 grayscale-100 overflow-hidden"
      />
      <Stats
        showPanel={0}
        parent={container as React.RefObject<HTMLElement>}
        className="relative!"
      />
    </>
  );
}
