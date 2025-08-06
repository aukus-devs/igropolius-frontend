import { useRef, useState } from 'react';
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
  const [isOn, setIsOn] = useState(true);
  const phaseStart = useRef(0);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const timeInPhase = elapsed - phaseStart.current;

    if (isOn && timeInPhase > onDuration) {
      setIsOn(false);
      phaseStart.current = elapsed;
    } else if (!isOn && timeInPhase > offDuration) {
      setIsOn(true);
      phaseStart.current = elapsed;
    }

    if (lightRef.current) {
      lightRef.current.intensity = isOn ? onIntensity : 0;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      color={color}
      distance={10}
      decay={2}
      castShadow
    />
  );
}
