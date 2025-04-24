import "./index.css";
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { useShallow } from "zustand/shallow";

import { Controls } from "./lib/constants";
import Scene from "./components/map/Scene";
import UI from "./components/UI";
import usePlayerStore from "./stores/playerStore";
import { playersData } from "./lib/mockData";

function App() {
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.up, keys: ["Space"] },
      { name: Controls.down, keys: ["KeyC"] },
      { name: Controls.turnLeft, keys: ["KeyQ"] },
      { name: Controls.turnRight, keys: ["KeyE"] },
    ],
    [],
  );

  const { setPlayers, setMyPlayer } = usePlayerStore(
    useShallow((state) => ({
      setPlayers: state.setPlayers,
      setMyPlayer: state.setMyPlayer,
    })),
  );

  useEffect(() => {
    setMyPlayer(playersData[0]);
    setPlayers(playersData);
  }, [setPlayers, setMyPlayer]);

  return (
    <KeyboardControls map={map}>
      <div className="h-screen">
        <UI />
        <Canvas camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 120, -100] }}>
          <Scene />
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

export default App;
