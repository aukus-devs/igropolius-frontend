import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function BlinkingLight({
  position = [0, 2, 0],
  color = 'white',
  onIntensity = 20,
  onDuration = 0.2,
  offDuration = 1.0,
}: {
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  onIntensity?: number;
  onDuration?: number;
  offDuration?: number;
}) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const lightOn = useRef(true);
  const phaseStart = useRef(0);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const timeInPhase = elapsed - phaseStart.current;

    if (lightOn.current && timeInPhase > onDuration) {
      lightOn.current = false;
      phaseStart.current = elapsed;
    } else if (!lightOn.current && timeInPhase > offDuration) {
      lightOn.current = true;
      phaseStart.current = elapsed;
    }

    if (lightRef.current) {
      lightRef.current.intensity = lightOn.current ? onIntensity : 0;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      distance={25}
      decay={0.5}
      castShadow
    />
  );
}
