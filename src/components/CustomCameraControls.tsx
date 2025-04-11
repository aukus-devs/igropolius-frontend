import { CameraControls, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

interface Props {
  keysMovespeed?: number;
}

export function CustomCameraControls({ keysMovespeed = 10 }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, getKeys] = useKeyboardControls();
  const cameraControls = useRef<CameraControls | null>(null);

  useFrame((_, delta) => {
    const { forward, backward, left, right, up, down } = getKeys();
    const speed = keysMovespeed * delta;

    if (forward) cameraControls.current?.forward(speed, false);
    if (backward) cameraControls.current?.forward(-speed, false);
    if (left) cameraControls.current?.truck(-speed, 0, false);
    if (right) cameraControls.current?.truck(speed, 0, false);
    if (up) cameraControls.current?.truck(0, -speed, false);
    if (down) cameraControls.current?.truck(0, speed, false);
  });

  return <CameraControls ref={cameraControls} makeDefault dollyToCursor />;
}

export default CustomCameraControls;
