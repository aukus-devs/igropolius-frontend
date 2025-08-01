import { Stats } from '@react-three/drei';
import { useRef } from 'react';

export default function FPSCounter() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={container}
        className="absolute bottom-[25px] left-[10px] h-[13px] scale-125 overflow-hidden"
      />
      <Stats parent={container as React.RefObject<HTMLElement>} className="relative!" />;
    </>
  );
}
