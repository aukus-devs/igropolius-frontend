import { CameraControls as CameraControlsComponent, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import CameraControls from "camera-controls";

interface Props {
  keysMovespeed?: number;
}

export function CustomCameraControls({ keysMovespeed = 10 }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, getKeys] = useKeyboardControls();
  const cameraControls = useRef<CameraControlsComponent | null>(null);

  useEffect(() => {
    if (cameraControls.current) {
      cameraControls.current.mouseButtons.right = CameraControls.ACTION.SCREEN_PAN;
    }
  }, [cameraControls]);

  useFrame((_, delta) => {
    const { forward, backward, left, right, up, down, turnLeft, turnRight } = getKeys();
    const speed = keysMovespeed * delta;

    if (forward) cameraControls.current?.forward(speed * 2, false);
    if (backward) cameraControls.current?.forward(-speed * 2, false);
    if (left) cameraControls.current?.truck(-speed * 2, 0, false);
    if (right) cameraControls.current?.truck(speed * 2, 0, false);
    if (up) cameraControls.current?.truck(0, -speed, false);
    if (down) cameraControls.current?.truck(0, speed, false);
    if (turnLeft) cameraControls.current?.rotate(speed / 10, 0, false);
    if (turnRight) cameraControls.current?.rotate(-speed / 10, 0, false);
  });

  return <CameraControlsComponent ref={cameraControls} makeDefault dollyToCursor maxDistance={120} />;
}

export default CustomCameraControls;
