import CustomCameraControls from "./CustomCameraControls";
import Floor from "./Floor";
import { Grid } from "@react-three/drei";
import GameBoard from "./GameBoard";

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

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={3} />
      <CustomCameraControls />

      <GameBoard />

      <Floor />

      {/* origin position marker */}
      <Grid position={[0, 1, 0]} args={[1, 1]} {...gridConfig} />
    </>
  );
}

export default Scene;
