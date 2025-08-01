import { useRef, useCallback } from 'react';

export function useSound(soundPath: string, muted: boolean = false) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const play = useCallback(() => {
        if (muted) return;

        if (!audioRef.current) {
            audioRef.current = new Audio(soundPath);
            audioRef.current.volume = 0.3;
        }

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
            console.warn('Failed to play sound:', error);
        });
    }, [soundPath, muted]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    return { play, stop };
} 