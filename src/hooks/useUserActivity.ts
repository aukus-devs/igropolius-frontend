import { useEffect, useState, useRef } from 'react';

export function useUserActivity(inactivityTimeout = 2 * 60 * 1000) { // 2 min
    const [isInactive, setIsInactive] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsInactive(false);

        timeoutRef.current = setTimeout(() => {
            setIsInactive(true);
        }, inactivityTimeout);
    };

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown',
            'wheel'
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
    }, [inactivityTimeout]);

    return { isInactive, resetTimer };
} 