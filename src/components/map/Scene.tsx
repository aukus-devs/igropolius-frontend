import CustomCameraControls from "./CustomCameraControls";
import Floor from "./Floor";
import { Grid, Stats } from "@react-three/drei";
import GameBoard from "./GameBoard";
import { Railroad } from "./Railroad";
import { colors } from "@/lib/types";
import Skybox from "./Skybox";

function Scene() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 1,
    cellColor: "#6f6f6f",
    sectionSize: 3.3,
    sectionThickness: 1.5,
    sectionColor: "#9d4b4b",
    fadeDistance: 200,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: false,
  };
  // const gl = useThree((state) => state.gl);

  // useFrame(() => {
  //   console.log("Draw Calls:", gl.info.render.calls);
  // })
  // const scene = useThree((state) => state.scene);
  // const hemisphereLightRef = useRef<HemisphereLight>(null);
  // const directionalLightRef = useRef<DirectionalLight>(null);

  // useEffect(() => {
  //   if (hemisphereLightRef.current) {
  //     const helper = new HemisphereLightHelper(hemisphereLightRef.current, 3);
  //     scene.add(helper);
  //   }
  // }, [hemisphereLightRef, scene]);

  // useEffect(() => {
  //   if (directionalLightRef.current) {
  //     const helper = new DirectionalLightHelper(directionalLightRef.current, 3);
  //     scene.add(helper);

  //     // Create a helper for the shadow camera
  //     const shadowCameraHelper = new CameraHelper(directionalLightRef.current.shadow.camera)
  //     scene.add(shadowCameraHelper)
  //   }
  // }, [directionalLightRef, scene]);

  return (
    <>
      <ambientLight intensity={0.3} color="#D3D3D3" />
      <hemisphereLight
        position={[0, 5, 0]}
        intensity={0.5}
        color="#87CEEB"
        groundColor={colors.pastelgreen}
      />
      <directionalLight
        // ref={directionalLightRef}
        color="#fcffb5"
        position={[50, 50, 50]}
        intensity={1.5}
        lookAt={[0, 0, 0]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      <CustomCameraControls />

      <GameBoard />
      <Railroad />
      <Floor />

      {/* origin position marker */}
      <Grid position={[0, 1, 0]} args={[1, 1]} {...gridConfig} />
      <Stats className="fps-meter" />
      <Skybox />
    </>
  );
}

export default Scene;
