import { CameraControls as CameraControlsComponent, useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { Box3, Vector3 } from "three";
import { FLOOR_SIZE, SECTOR_WIDTH } from "@/lib/constants";
import useAppStore from "@/stores/appStore";

interface Props {
  keysMovespeed?: number;
}

export function CustomCameraControls({ keysMovespeed = 10 }: Props) {
  const setCameraControls = useAppStore((state) => state.setCameraControls);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, getKeys] = useKeyboardControls();
  const cameraControls = useRef<CameraControlsComponent | null>(null);

  useEffect(() => {
    if (cameraControls.current) {
      const boundarySize = FLOOR_SIZE / 2 + SECTOR_WIDTH * 2;
      const bb = new Box3(
        new Vector3(-boundarySize, 1, -boundarySize),
        new Vector3(boundarySize, boundarySize, boundarySize)
      );
      // const helper = new Box3Helper(bb, 0xffff00);
      // scene.add(helper);

      cameraControls.current.mouseButtons.right = CameraControls.ACTION.SCREEN_PAN;
      cameraControls.current.setBoundary(bb);
      setCameraControls(cameraControls.current);
    }
  }, [cameraControls, setCameraControls]);

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

  return (
    <>
      <CameraControlsComponent
        ref={cameraControls}
        makeDefault
        dollyToCursor
        dollySpeed={0.75}
        maxDistance={120}
        maxZoom={120}
      />
    </>
  );
}

export default CustomCameraControls;
