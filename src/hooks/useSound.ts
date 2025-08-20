import { useRef, useCallback } from 'react';
import { ARMY_SOUND_URL, DRUM_SOUND_URL, INDIAN_ROLL_URL } from '@/lib/constants';

const SOUNDS = {
  army: ARMY_SOUND_URL,
  indian: INDIAN_ROLL_URL,
  drum: DRUM_SOUND_URL,
} as const;

export function useSound(muted: boolean = false, loop: boolean = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(
    (sound: 'army' | 'indian' | 'drum') => {
      if (muted) return;

      const soundPath = SOUNDS[sound];
      if (!audioRef.current) {
        audioRef.current = new Audio(soundPath);
        audioRef.current.volume = 0.3;
        audioRef.current.loop = loop;
      } else {
        audioRef.current.src = soundPath;
        audioRef.current.loop = loop;
      }

      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.warn('Failed to play sound:', error);
      });
    },
    [muted, loop]
  );

  const playRandom = useCallback(() => {
    const soundKeys = Object.keys(SOUNDS) as Array<keyof typeof SOUNDS>;
    const randomSound = soundKeys[Math.floor(Math.random() * soundKeys.length)];
    // console.log('random sound', randomSound);
    play(randomSound);
  }, [play]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop, playRandom };
}
