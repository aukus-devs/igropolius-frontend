import { useRef, useState } from 'react';

export default function useScrollStyler() {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  const onRender = (element: HTMLDivElement | null) => {
    if (!element) return;

    stickyRef.current = element;

    const container = element.closest('#scroll-area-viewport');
    if (!container) return; // fallback

    const handleScroll = () => {
      // console.log({ scrollRef: stickyRef.current });
      if (!stickyRef.current) return;

      const cRect = container.getBoundingClientRect();
      const sRect = stickyRef.current.getBoundingClientRect();
      const topRelative = sRect.top - cRect.top;
      setStuck(topRelative <= 0);
    };
    // Run on mount and on scroll
    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  };

  const style: React.CSSProperties = {};
  if (stuck) {
    style.backgroundColor = 'rgba(129, 167, 114, 0.1)';
    style.backdropFilter = 'blur(10px)';
    style.borderRadius = '16px';
  } else {
    style.background = 'transparent';
  }

  return {
    onRender,
    style,
  };
}
