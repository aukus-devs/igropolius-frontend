import { useEffect, useState, useRef, useCallback } from 'react';

export function useUserActivity(inactivityTimeout = 2 * 60 * 1000) {
  const [isInactive, setIsInactive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsInactive(false);

    timeoutRef.current = setTimeout(() => {
      setIsInactive(true);
    }, inactivityTimeout);
  }, [inactivityTimeout]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'wheel',
    ];

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetTimer]);

  return { isInactive, resetTimer };
}
