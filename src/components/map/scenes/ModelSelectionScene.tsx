import { updatePlayer } from '@/lib/api';
import {
  PLAYER_WIDTH,
  PlayerModelsScales,
  PlayerModelsUrlsArray,
  SECTOR_CONTENT_ELEVATION,
} from '@/lib/constants';
import { refetechPlayersQuery } from '@/lib/queryClient';
import { playerColors, Vector3Array } from '@/lib/types';
import usePlayerStore from '@/stores/playerStore';
import { Box, CameraControls, Gltf, PerspectiveCamera, Text, useCursor } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { Color, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
type ModelProps = {
  position: Vector3Array;
  color: string;
  url: string;
  isSelected: boolean;
  onClick?: () => void;
  isDisabled: boolean;
};

function Model({ url, position, color, isSelected, onClick, isDisabled }: ModelProps) {
  const [isHovered, setHover] = useState(false);
  const ref = useRef<Group>(null);

  const scale = PlayerModelsScales[url] || 1;

  useCursor(isHovered);

  const scaleVector = new Vector3(1, 1, 1);
  const disabledColor = new Color('grey');
  const selectColor = new Color(color);

  useFrame(() => {
    if (!ref.current) return;

    const targetScale = isHovered || isSelected ? scale * 1.5 : scale;
    scaleVector.set(targetScale, targetScale, targetScale);
    ref.current.scale.lerp(scaleVector, 0.25);

    ref.current.traverse(child => {
      if (child instanceof Mesh) {
        if (child.name === 'body001') {
          const targetColor = isDisabled ? disabledColor : selectColor;
          child.material.color.lerp(targetColor, 0.25);
        }
      }
    });
  });

  const gltf = useMemo(() => {
    return (
      <Gltf
        ref={ref}
        src={url}
        position={position}
        scale={scale}
        onClick={e => (e.stopPropagation(), !isDisabled && onClick?.())}
        onPointerEnter={() => !isDisabled && setHover(true)}
        onPointerLeave={() => !isDisabled && setHover(false)}
      />
    );
  }, [url, position, scale, onClick, isDisabled]);

  return <>{gltf}</>;
}

function ColorBox({ position, color, isSelected, onClick, isDisabled }: Omit<ModelProps, 'url'>) {
  const [isHovered, setHover] = useState(false);
  const ref = useRef<Mesh>(null);

  useCursor(isHovered);

  const scaleVector = new Vector3(1, 1, 1);
  const selectColor = new Color(color);

  useFrame(() => {
    if (!ref.current) return;

    const targetScale = isHovered || isSelected ? 1.3 : 1;
    scaleVector.set(targetScale, targetScale, targetScale);
    ref.current.scale.lerp(scaleVector, 0.25);

    const targetColor = isDisabled ? new Color('grey') : selectColor;
    const material = ref.current.material as MeshStandardMaterial;
    material.color.lerp(targetColor, 0.25);
  });

  function onclick(e: ThreeEvent<PointerEvent>) {
    if (!isDisabled) {
      e.stopPropagation();
      onClick?.();
    }
  }

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={onclick}
      onPointerEnter={() => !isDisabled && setHover(true)}
      onPointerLeave={() => !isDisabled && setHover(false)}
    >
      <boxGeometry args={[1, 0.5, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Button3D({ isDisabled, onClick }: { isDisabled: boolean; onClick: () => void }) {
  const [isHovered, setHover] = useState(false);
  const [isPressed, setPressed] = useState(false);
  const buttonRef = useRef<Group>(null);
  const scale = new Vector3(1, 1, 1);

  useCursor(isHovered && !isDisabled);

  useFrame(() => {
    if (buttonRef.current && !isDisabled) {
      const targetScale = isHovered ? (isPressed ? 1 : 2) : 1;
      scale.set(1, 1, targetScale);
      buttonRef.current.scale.lerp(scale, 0.25);
    }
  });

  return (
    <group
      ref={buttonRef}
      position={[-13, SECTOR_CONTENT_ELEVATION, 0]}
      rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}
      onClick={e => !isDisabled && (e.stopPropagation(), onClick?.())}
      onPointerOver={e => (e.stopPropagation(), setHover(true))}
      onPointerOut={e => (e.stopPropagation(), setPressed(false), setHover(false))}
      onPointerDown={e => (e.stopPropagation(), setPressed(true))}
      onPointerUp={e => (e.stopPropagation(), setPressed(false))}
    >
      <Box args={[8, 2, 0.5]}>
        <meshStandardMaterial color={isDisabled ? 'dimgray' : '#81a971'} />
      </Box>
      <Text
        position={[0, 0, 0.501]} // Slightly above the button surface
        color={isDisabled ? 'darkgray' : '#34492c'}
        anchorX="center"
        anchorY="middle"
        raycast={() => null}
      >
        Подтвердить
      </Text>
    </group>
  );
}

function ModelSelectionScene() {
  const [selectedColor, setColor] = useState<string | null>(null);
  const [selectedUrl, setUrl] = useState<string | null>(null);

  const players = usePlayerStore(state => state.players);

  const modelsTaken = players.map(player => player.model_name);
  const colorsTaken = players.map(player => player.color);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updatePlayer,
  });

  function toggleUrl(url: string) {
    if (selectedUrl === url) {
      setUrl(null);
      return;
    }
    setUrl(url);
  }

  function toggleColor(color: string) {
    if (selectedColor === color) {
      setColor(null);
      return;
    }
    setColor(color);
  }

  const confirm = async () => {
    if (!selectedColor || !selectedUrl) {
      return;
    }

    const modelName = selectedUrl.split('/players/')[1];

    try {
      await mutateAsync({ color: selectedColor, model_name: modelName });
      refetechPlayersQuery();
    } catch {
      setColor(null);
      setUrl(null);
      refetechPlayersQuery();
    }
  };

  return (
    <group>
      <PerspectiveCamera makeDefault position={[-20, 27, -20]} fov={45} />
      <CameraControls
        makeDefault
        mouseButtons={{ right: 0, left: 1, middle: 0, wheel: 0 }}
        dollySpeed={0.75}
        minDistance={255}
        maxDistance={255}
        maxZoom={225}
        smoothTime={0.2}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 4}
      />
      <mesh>
        <boxGeometry args={[200, 1, 200]} />
        <meshStandardMaterial color="black" />
      </mesh>

      <group rotation={[0, Math.PI, 0]}>
        <Text
          color="white"
          position={[-8.5, SECTOR_CONTENT_ELEVATION + 0.1, 0]}
          rotation={[Math.PI / 2, -Math.PI, -Math.PI / 2]}
        >
          Выберите модельку
        </Text>
        {PlayerModelsUrlsArray.map((url, idx) => {
          const isTaken = modelsTaken.includes(url.split('/players/')[1]);
          return (
            <Model
              key={idx}
              url={url}
              position={calculateGridPosition({
                idx,
                size: [4, 4],
                gap: [PLAYER_WIDTH * 2, 5],
              })}
              isSelected={url === selectedUrl}
              isDisabled={isTaken}
              color={selectedColor || 'white'}
              onClick={() => toggleUrl(url)}
            />
          );
        })}
      </group>

      <group position={[13, 0, 0]}>
        <Text
          color="white"
          position={[3.5, SECTOR_CONTENT_ELEVATION + 0.1, 0]}
          rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}
        >
          Выберите цвет
        </Text>
        <group position={[0, 0.5, 0]}>
          {Object.values(playerColors).map((color, idx) => (
            <ColorBox
              key={idx}
              color={color}
              position={calculateGridPosition({
                idx,
                size: [5, 2],
                gap: [2, 2],
              })}
              isSelected={color === selectedColor}
              isDisabled={colorsTaken.includes(color)}
              onClick={() => toggleColor(color)}
            />
          ))}
        </group>
      </group>

      <Button3D isDisabled={!selectedColor || !selectedUrl || isPending} onClick={confirm} />
    </group>
  );
}

type calculateGridPositionArgs = {
  idx: number;
  size: [number, number];
  gap: [number, number];
};

function calculateGridPosition({ idx, size, gap }: calculateGridPositionArgs) {
  const rows = size[0];
  const cols = size[1];
  const x = (idx % cols) * gap[0] - (cols * gap[0]) / 2 + gap[0] / 2;
  const z = -(Math.floor(idx / cols) * gap[1]) + (rows * gap[1]) / 2 - gap[1] / 2;

  return [x, SECTOR_CONTENT_ELEVATION, z] as Vector3Array;
}

export default ModelSelectionScene;
