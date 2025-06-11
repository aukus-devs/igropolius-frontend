import {
  CameraControls as CameraControlsComponent,
  useKeyboardControls,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import CameraControls from "camera-controls";
import { Box3, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { BOARD_SIZE, SECTOR_DEPTH, SECTOR_HEIGHT } from "@/lib/constants";
import useCameraStore from "@/stores/cameraStore";
import usePlayerStore from "@/stores/playerStore";

export function CustomCameraControls() {
  const [_, getKeys] = useKeyboardControls();
  const { set } = useThree(({ set }) => ({ set }));
  const setCameraControls = useCameraStore((state) => state.setCameraControls);
  const isOrthographic = useCameraStore((state) => state.isOrthographic);
  const cameraToPlayer = useCameraStore((state) => state.cameraToPlayer);
  const myPlayerId = usePlayerStore((state) => state.myPlayerId);
  const cameraControls = useRef<CameraControlsComponent | null>(null);

  const keysMovespeed = 10;

  useEffect(() => {
    if (myPlayerId) {
      setTimeout(() => {
        cameraToPlayer(myPlayerId);
      }, 700)
    }
  }, [myPlayerId, cameraToPlayer]);

  useEffect(() => {
    const newCamera = isOrthographic
      ? new OrthographicCamera(
        window.innerWidth / -2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / -2,
        0.1,
        1000
      )
      : new PerspectiveCamera(
        45, window.innerWidth / window.innerHeight, 0.1, 1000
      );

    newCamera.zoom = isOrthographic ? 7 : 1;
    newCamera.position.set(0, 120, isOrthographic ? -0.1 : -100);
    newCamera.updateProjectionMatrix();

    set({ camera: newCamera });
  }, [isOrthographic, set]);

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

  function onCameraControlsUpdate(controls: CameraControls) {
    const boundarySize = BOARD_SIZE / 2 + SECTOR_DEPTH;
    const bb = new Box3(
      new Vector3(-boundarySize, SECTOR_HEIGHT, -boundarySize),
      new Vector3(boundarySize, boundarySize, boundarySize),
    );
    // const helper = new Box3Helper(bb, 0xffff00);
    // scene.add(helper);

    controls.mouseButtons.right = CameraControls.ACTION.SCREEN_PAN;
    controls.setBoundary(bb);
    setCameraControls(controls);
  }

  return (
    <>
      <CameraControlsComponent
        ref={cameraControls}
        dollySpeed={0.75}
        maxDistance={225}
        maxZoom={225}
        maxPolarAngle={Math.PI / 2}
        smoothTime={0.2}
        enabled={!isOrthographic}
        onUpdate={onCameraControlsUpdate}
      />
    </>
  );
}

export default CustomCameraControls;
