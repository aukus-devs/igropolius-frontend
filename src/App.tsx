import "./index.css";
import { Canvas } from "@react-three/fiber";
import { AppProvider } from "./contexts/AppContext";
import { useMemo } from "react";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Controls } from "./lib/constants";
import Scene from "./components/Scene";
import UI from "./components/UI";

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.up, keys: ["Space", "KeyQ"] },
      { name: Controls.down, keys: ["KeyC", "KeyE", "Shift"] },
    ],
    [],
  );

  return (
    <KeyboardControls map={map}>
      <AppProvider>
        <div className="h-screen">
          <UI />
          <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0.1, 49, 33] }}>
            <Scene />
          </Canvas>
        </div>
      </AppProvider>
    </KeyboardControls>
  );
}

export default App;
