import { useRef, useCallback } from 'react';
import {
  ARMY_SOUND_URL,
  DASBOOT_SOUND_URL,
  DRUM_SOUND_URL,
  DVAR_SOUND_URL,
  INDIAN_ROLL_URL,
  MAX_SOUND_URL,
} from '@/lib/constants';

const SOUNDS = {
  army: ARMY_SOUND_URL,
  indian: INDIAN_ROLL_URL,
  drum: DRUM_SOUND_URL,
  max: MAX_SOUND_URL,
  dasboot: DASBOOT_SOUND_URL,
  dvar: DVAR_SOUND_URL,
} as const;

const LAST_SOUND_KEY = 'lastPlayedSound';

export function useSound(muted: boolean = false, loop: boolean = false) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getLastPlayedSound = useCallback(() => {
    try {
      return localStorage.getItem(LAST_SOUND_KEY);
    } catch {
      return null;
    }
  }, []);

  const setLastPlayedSound = useCallback((sound: string) => {
    try {
      localStorage.setItem(LAST_SOUND_KEY, sound);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const play = useCallback(
    (sound: keyof typeof SOUNDS) => {
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

      setLastPlayedSound(sound);
    },
    [muted, loop, setLastPlayedSound]
  );

  const playRandom = useCallback(() => {
    const soundKeys = Object.keys(SOUNDS) as Array<keyof typeof SOUNDS>;
    const lastSound = getLastPlayedSound();

    let availableSounds = soundKeys;
    if (lastSound && soundKeys.length > 1) {
      availableSounds = soundKeys.filter(sound => sound !== lastSound);
    }

    const randomSound = availableSounds[Math.floor(Math.random() * availableSounds.length)];
    play(randomSound);
  }, [play, getLastPlayedSound]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop, playRandom };
}
